/**
 * Authentication Module for Antreva CRM
 * Handles password hashing, session management, RBAC, and MFA.
 * 
 * SOC 2 Compliance:
 * - bcrypt with cost factor 12+ for password hashing
 * - 24-hour session expiry with refresh on activity
 * - Failed login lockout after 5 attempts
 * - TOTP-based MFA support
 */

import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import * as OTPLib from "otplib";
import { prisma } from "./prisma";
import { generateToken, hash, encrypt, decrypt } from "./encryption";

// OTPLib v13+ API
const { generateSecret: generateTOTPSecret, generate: generateTOTP, verify: verifyTOTP, generateURI } = OTPLib;

/** Bcrypt cost factor (SOC 2: 12+) */
const BCRYPT_ROUNDS = 12;

/** Session duration in milliseconds (24 hours) */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/** Maximum failed login attempts before lockout */
const MAX_FAILED_ATTEMPTS = 5;

/** Lockout duration in milliseconds (15 minutes) */
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/** Cookie name for session token */
const SESSION_COOKIE = "antreva_session";

// Re-export password policy (client-safe) so server code can import from auth
export {
  validatePasswordComplexity,
  PASSWORD_REQUIREMENTS,
  PASSWORD_MIN_LENGTH,
  type PasswordValidationResult,
} from "./passwordPolicy";

// =============================================================================
// PASSWORD HASHING
// =============================================================================

/**
 * Hashes a password using bcrypt.
 * @param password - Plaintext password
 * @returns Bcrypt hash
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verifies a password against a bcrypt hash.
 * Uses constant-time comparison.
 * @param password - Plaintext password
 * @param hash - Bcrypt hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Session data returned after validation.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  title: string | null;
  roleId: string;
  roleName: string;
  permissions: string[];
  /** User's preferred dashboard language: "es" | "en", null = use cookie/default */
  preferredLocale: "es" | "en" | null;
}

/**
 * Creates a new session for a user.
 * @param userId - User ID
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 * @returns Session token (to be stored in cookie)
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateToken(32);
  const hashedToken = hash(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      token: hashedToken,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return token;
}

/**
 * Validates a session token and returns user data.
 * @param token - Session token from cookie
 * @returns User data if valid, null otherwise
 */
export async function validateSession(token: string): Promise<SessionUser | null> {
  const hashedToken = hash(token);

  const session = await prisma.session.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!session || session.user.status !== "active") {
    return null;
  }

  const preferredLocale = session.user.preferredLocale;
  const locale =
    preferredLocale === "es" || preferredLocale === "en" ? preferredLocale : null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    title: session.user.title,
    roleId: session.user.roleId,
    roleName: session.user.role.name,
    permissions: session.user.role.permissions as string[],
    preferredLocale: locale,
  };
}

/**
 * Gets the current session from cookies.
 * @returns User data if authenticated, null otherwise
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return validateSession(token);
}

/**
 * Sets the session cookie.
 * @param token - Session token
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });
}

/**
 * Destroys the current session.
 * @param token - Optional specific token; uses cookie if not provided
 */
export async function destroySession(token?: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = token || cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    const hashedToken = hash(sessionToken);
    await prisma.session.deleteMany({
      where: { token: hashedToken },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Destroys all sessions for a user (logout everywhere).
 * @param userId - User ID
 */
export async function destroyAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

// =============================================================================
// RBAC (Role-Based Access Control)
// =============================================================================

/**
 * Checks if a user has a specific permission.
 * @param user - Session user data
 * @param permission - Permission string (e.g., "clients.read")
 * @returns True if user has permission
 */
export function hasPermission(user: SessionUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

/**
 * Checks if a user has any of the specified permissions.
 * @param user - Session user data
 * @param permissions - Array of permission strings
 * @returns True if user has at least one permission
 */
export function hasAnyPermission(user: SessionUser, permissions: string[]): boolean {
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Checks if a user has all specified permissions.
 * @param user - Session user data
 * @param permissions - Array of permission strings
 * @returns True if user has all permissions
 */
export function hasAllPermissions(user: SessionUser, permissions: string[]): boolean {
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Requires a permission, throws if not present.
 * @param user - Session user data
 * @param permission - Required permission
 * @throws Error if permission is missing
 */
export function requirePermission(user: SessionUser, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

// =============================================================================
// LOGIN / LOCKOUT
// =============================================================================

/**
 * Result of a login attempt.
 */
export interface LoginResult {
  success: boolean;
  user?: SessionUser;
  token?: string;
  error?: string;
  requiresMfa?: boolean;
}

/**
 * Attempts to log in a user.
 * Handles failed attempts and lockout.
 * 
 * @param email - User email
 * @param password - User password
 * @param ipAddress - Client IP
 * @param userAgent - Client user agent
 * @returns Login result
 */
export async function login(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  // User not found
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  // Account inactive
  if (user.status !== "active") {
    return { success: false, error: "Account is not active" };
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMs = user.lockedUntil.getTime() - Date.now();
    const remainingMins = Math.ceil(remainingMs / 60000);
    return {
      success: false,
      error: `Account locked. Try again in ${remainingMins} minute(s).`,
    };
  }

  // Verify password
  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    // Increment failed attempts
    const newAttempts = user.failedLoginAttempts + 1;
    const lockout = newAttempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil: lockout ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
      },
    });

    if (lockout) {
      return {
        success: false,
        error: `Too many failed attempts. Account locked for 15 minutes.`,
      };
    }

    return { success: false, error: "Invalid email or password" };
  }

  // Check if MFA is required
  const preferredLocale =
    user.preferredLocale === "es" || user.preferredLocale === "en"
      ? user.preferredLocale
      : null;
  if (user.mfaSecret) {
    return {
      success: false,
      requiresMfa: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        title: user.title,
        roleId: user.roleId,
        roleName: user.role.name,
        permissions: user.role.permissions as string[],
        preferredLocale,
      },
    };
  }

  // Create session
  const token = await createSession(user.id, ipAddress, userAgent);

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      title: user.title,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: user.role.permissions as string[],
      preferredLocale,
    },
  };
}

// =============================================================================
// MFA (Multi-Factor Authentication)
// =============================================================================

/**
 * Generates a new MFA secret for a user.
 * @param userId - User ID
 * @returns Object with secret and otpauth URL for QR code
 */
export async function generateMfaSecret(userId: string): Promise<{
  secret: string;
  otpauthUrl: string;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const secret = generateTOTPSecret();
  const otpauthUrl = generateURI({ issuer: "Antreva CRM", label: user.email, secret });

  return { secret, otpauthUrl };
}

/**
 * Enables MFA for a user by storing encrypted secret.
 * @param userId - User ID
 * @param secret - TOTP secret
 * @param code - Verification code to confirm setup
 * @returns True if successful
 */
export async function enableMfa(
  userId: string,
  secret: string,
  code: string
): Promise<boolean> {
  // Verify the code first
  const isValid = await verifyTOTP({ token: code, secret });
  if (!isValid) {
    return false;
  }

  // Encrypt and store
  const { encrypted, iv } = encrypt(secret);
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: encrypted,
      mfaSecretIv: iv,
    },
  });

  return true;
}

/**
 * Disables MFA for a user.
 * @param userId - User ID
 */
export async function disableMfa(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: null,
      mfaSecretIv: null,
    },
  });
}

/**
 * Verifies an MFA code for a user.
 * @param userId - User ID
 * @param code - TOTP code
 * @returns True if valid
 */
export async function verifyMfa(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user?.mfaSecret || !user.mfaSecretIv) {
    return false;
  }

  const secret = decrypt(user.mfaSecret, user.mfaSecretIv);
  const result = await verifyTOTP({ token: code, secret });
  return typeof result === "object" && result !== null && "valid" in result && result.valid === true;
}

/**
 * Completes login after MFA verification.
 * @param userId - User ID
 * @param code - MFA code
 * @param ipAddress - Client IP
 * @param userAgent - Client user agent
 * @returns Login result
 */
export async function completeMfaLogin(
  userId: string,
  code: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const isValid = await verifyMfa(userId, code);
  
  if (!isValid) {
    return { success: false, error: "Invalid MFA code" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const token = await createSession(userId, ipAddress, userAgent);
  const preferredLocale =
    user.preferredLocale === "es" || user.preferredLocale === "en"
      ? user.preferredLocale
      : null;

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      title: user.title,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: user.role.permissions as string[],
      preferredLocale,
    },
  };
}
