import { createHash } from "crypto";

function hashPassword(password, salt) {
  return createHash("sha256").update(salt + password).digest("hex");
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body;

  const storedUsername = process.env.DASH_USERNAME || "admin";
  const storedHash = process.env.DASH_PASSWORD_HASH;
  const storedSalt = process.env.DASH_PASSWORD_SALT;

  if (!storedHash || !storedSalt) {
    // Fallback: plain-text password from env var
    const plainPassword = process.env.DASH_PASSWORD || "admin";
    if (username === storedUsername && password === plainPassword) {
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, error: "Invalid credentials." });
  }

  if (username === storedUsername && hashPassword(password, storedSalt) === storedHash) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials." });
  }
}
