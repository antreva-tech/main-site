/**
 * Encryption Module for Antreva CRM
 * Provides AES-256-GCM encryption for sensitive data (credentials, tokens, etc.)
 * 
 * SOC 2 Compliance: All decrypt operations should be logged to AuditLog.
 * 
 * @see https://nodejs.org/api/crypto.html
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Gets the encryption key from environment.
 * Key must be a 32-byte hex string (64 characters).
 * @throws Error if ENCRYPTION_KEY is not set or invalid
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  
  if (key.length !== 64) {
    throw new Error(
      `ENCRYPTION_KEY must be 64 hex characters (32 bytes). Got ${key.length} characters.`
    );
  }
  
  return Buffer.from(key, "hex");
}

/**
 * Encrypted value with initialization vector.
 */
export interface EncryptedValue {
  /** Encrypted data with auth tag (hex encoded) */
  encrypted: string;
  /** Initialization vector (hex encoded) */
  iv: string;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * 
 * @param plaintext - The string to encrypt
 * @returns Object containing encrypted value and IV (both hex encoded)
 * 
 * @example
 * const { encrypted, iv } = encrypt("my-secret-password");
 * // Store both encrypted and iv in database
 */
export function encrypt(plaintext: string): EncryptedValue {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Append auth tag to encrypted data
  const authTag = cipher.getAuthTag().toString("hex");
  
  return {
    encrypted: encrypted + ":" + authTag,
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypts an encrypted value using AES-256-GCM.
 * 
 * IMPORTANT: Log all decrypt operations to AuditLog for SOC 2 compliance.
 * 
 * @param encrypted - The encrypted string with auth tag (format: "ciphertext:authTag")
 * @param iv - The initialization vector used during encryption
 * @returns The decrypted plaintext string
 * @throws Error if decryption fails (invalid key, tampered data, etc.)
 * 
 * @example
 * const plaintext = decrypt(credential.encryptedValue, credential.iv);
 */
export function decrypt(encrypted: string, iv: string): string {
  const key = getEncryptionKey();
  
  // Split encrypted data and auth tag
  const [ciphertext, authTagHex] = encrypted.split(":");
  
  if (!ciphertext || !authTagHex) {
    throw new Error("Invalid encrypted format. Expected 'ciphertext:authTag'");
  }
  
  const ivBuffer = Buffer.from(iv, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Hashes a value using SHA-256.
 * Useful for session tokens where reversibility is not needed.
 * 
 * @param value - The string to hash
 * @returns Hex-encoded hash
 */
export function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Generates a cryptographically secure random token.
 * 
 * @param bytes - Number of random bytes (default: 32)
 * @returns Hex-encoded random string
 */
export function generateToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generates a new encryption key.
 * For administrative use only - key rotation.
 * 
 * @returns 32-byte hex string suitable for ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * 
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
