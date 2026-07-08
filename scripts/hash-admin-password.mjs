import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password || password.length < 10) {
  console.error('Usage: node scripts/hash-admin-password.mjs "your-strong-password"');
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const derived = scryptSync(password, salt, 64).toString("hex");

console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt}:${derived}`);
