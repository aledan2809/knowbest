/**
 * API key hashing / verification utilities.
 *
 * AUDIT-011 fix. Uses scrypt (Node built-in) instead of bcrypt to avoid
 * adding an external dependency.
 *
 * Stored format: "<salt_hex>:<hash_hex>"
 */

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashToken(raw: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(raw, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyToken(raw: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(raw, salt, 64);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/**
 * Generate a new raw API token with the standard `kb_` prefix.
 * The return value is the plaintext — never store this; only persist `hashToken(raw)`.
 */
export function generateToken(): string {
  return "kb_" + randomBytes(32).toString("base64url");
}
