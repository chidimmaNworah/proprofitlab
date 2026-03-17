import { createHash, randomBytes } from "crypto";
import { Redis } from "@upstash/redis";

function hashPassword(password, salt) {
  return createHash("sha256").update(salt + password).digest("hex");
}

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { currentPassword, newUsername, newPassword } = req.body;
  const redis = getRedis();

  // Verify current password
  let currentHash, currentSalt, currentUsername;

  try {
    const creds = await redis.hgetall("dash_credentials");
    if (creds && creds.username) {
      currentUsername = creds.username;
      currentHash = creds.passwordHash;
      currentSalt = creds.salt;
    }
  } catch {
    // Redis read failed
  }

  // If no Redis credentials, check env vars
  if (!currentHash) {
    currentUsername = process.env.DASH_USERNAME || "admin";
    const envHash = process.env.DASH_PASSWORD_HASH;
    const envSalt = process.env.DASH_PASSWORD_SALT;
    if (envHash && envSalt) {
      currentHash = envHash;
      currentSalt = envSalt;
    } else {
      // Plain-text fallback
      const plain = process.env.DASH_PASSWORD || "admin";
      if (currentPassword !== plain) {
        return res.status(401).json({ success: false, error: "Current password is incorrect." });
      }
      // Password matched via plain-text, proceed to save new creds
      currentHash = null;
    }
  }

  if (currentHash && hashPassword(currentPassword, currentSalt) !== currentHash) {
    return res.status(401).json({ success: false, error: "Current password is incorrect." });
  }

  if (!newUsername || !newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, error: "New username and password (min 4 chars) are required." });
  }

  const salt = randomBytes(16).toString("hex");
  try {
    await redis.hset("dash_credentials", {
      username: newUsername,
      passwordHash: hashPassword(newPassword, salt),
      salt,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Failed to save credentials." });
  }
}
