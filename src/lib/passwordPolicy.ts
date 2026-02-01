/**
 * Password complexity policy (client-safe).
 * Use this module in client components for PASSWORD_REQUIREMENTS.
 * Server code can import validatePasswordComplexity from here or from @/lib/auth.
 */

/** Minimum password length. */
export const PASSWORD_MIN_LENGTH = 12;

/** Human-readable requirements for UI hints. */
export const PASSWORD_REQUIREMENTS =
  "At least 12 characters, including uppercase, lowercase, a number, and a special character.";

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates password complexity. Use before hashPassword on invite, reset, and change-password flows.
 * Rules: min length, at least one uppercase, one lowercase, one digit, one special character.
 *
 * @param password - Plaintext password to validate
 * @returns { valid: true } or { valid: false, error: string }
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
  if (typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }
  const p = password;
  if (p.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }
  if (!/[A-Z]/.test(p)) {
    return { valid: false, error: "Password must include at least one uppercase letter" };
  }
  if (!/[a-z]/.test(p)) {
    return { valid: false, error: "Password must include at least one lowercase letter" };
  }
  if (!/\d/.test(p)) {
    return { valid: false, error: "Password must include at least one number" };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p)) {
    return { valid: false, error: "Password must include at least one special character (!@#$%^&* etc.)" };
  }
  return { valid: true };
}
