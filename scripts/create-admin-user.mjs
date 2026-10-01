#!/usr/bin/env node
// Generates a strong random admin password (or hashes one you pass as an
// argument), Argon2id-hashes it, and prints everything needed for .env.
// Usage:
//   npm run admin:create-user               (generates a random password)
//   npm run admin:create-user -- "my-pass"  (hashes a password you choose)

import { hash } from "@node-rs/argon2";
import { randomBytes } from "crypto";

function generatePassword(length = 20) {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const password = process.argv[2] || generatePassword();
const passwordHash = await hash(password, {
  algorithm: 2, // Argon2id
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});
// Argon2 hashes are full of literal `$` characters ($argon2id$v=19$...),
// and Next.js's .env loader (@next/env) does shell-style $VAR expansion on
// unescaped values — it silently mangles a raw hash into garbage. Base64
// encoding sidesteps the whole problem; decoded back in src/lib/auth/password.ts.
const passwordHashB64 = Buffer.from(passwordHash, "utf8").toString("base64");
const sessionSecret = randomBytes(32).toString("hex");

console.log("\nAdd these to your .env file:\n");
console.log(`ADMIN_USERNAME=admin`);
console.log(`ADMIN_PASSWORD_HASH_B64=${passwordHashB64}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
if (!process.argv[2]) {
  console.log(`\nGenerated password (save this in a password manager — it is not stored anywhere):`);
  console.log(`  ${password}`);
}
console.log("");
