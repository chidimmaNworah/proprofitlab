import { createHash } from "crypto";
import { Redis } from "@upstash/redis";

function hashPassword(password, salt) {
  return createHash("sha256")
    .update(salt + password)
    .digest("hex");
}

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body;

  try {
    // Try Redis-stored credentials first
    const redis = getRedis();
    const creds = await redis.hgetall("dash_credentials");

    if (creds && creds.username && creds.passwordHash && creds.salt) {
      if (
        username === creds.username &&
        hashPassword(password, creds.salt) === creds.passwordHash
      ) {
        return res.json({ success: true });
      }
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
  } catch {
    // Redis unavailable — fall through to env var check
  }

  // Fallback: env var credentials
  const storedUsername = process.env.DASH_USERNAME || "admin";
  const storedHash = process.env.DASH_PASSWORD_HASH;
  const storedSalt = process.env.DASH_PASSWORD_SALT;

  if (storedHash && storedSalt) {
    if (
      username === storedUsername &&
      hashPassword(password, storedSalt) === storedHash
    ) {
      return res.json({ success: true });
    }
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials." });
  }

  // Fallback: plain-text password from env var
  const plainPassword = process.env.DASH_PASSWORD || "admin";
  if (username === storedUsername && password === plainPassword) {
    return res.json({ success: true });
  }
  return res
    .status(401)
    .json({ success: false, error: "Invalid credentials." });
}
