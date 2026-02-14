/**
 * Audit Logging Module for Antreva CRM
 * Provides immutable event logging for SOC 2 compliance.
 * 
 * SOC 2 Requirements:
 * - Log all CRUD operations on sensitive entities
 * - Log authentication events (login, logout, failed attempts)
 * - Log credential access/decrypt operations
 * - Include who, what, when, and context (IP, user agent)
 * - Immutable: No UPDATE or DELETE on audit logs
 * - Retention: 7 years minimum
 */

import { headers } from "next/headers";
import { prisma } from "./prisma";
import type { AuditEntityType, AuditAction } from "@/generated/prisma/client";

/**
 * Metadata stored with audit log entries.
 */
export interface AuditMetadata {
  /** IP address of the client */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Value before change (redact sensitive fields) */
  before?: Record<string, unknown>;
  /** Value after change (redact sensitive fields) */
  after?: Record<string, unknown>;
  /** Additional context */
  context?: Record<string, unknown>;
  /** User preference e.g. preferredLocale */
  preferredLocale?: "es" | "en";
}

/**
 * Options for creating an audit log entry.
 */
export interface LogActionOptions {
  /** User ID who performed the action (null for system/anonymous) */
  userId?: string | null;
  /** Type of entity being acted upon */
  entityType: AuditEntityType;
  /** ID of the entity */
  entityId: string;
  /** Action performed */
  action: AuditAction;
  /** Additional metadata */
  metadata?: AuditMetadata;
}

/**
 * Fields that should be redacted from audit metadata.
 */
const SENSITIVE_FIELDS = [
  "password",
  "passwordHash",
  "encryptedValue",
  "accessToken",
  "accessTokenEncrypted",
  "mfaSecret",
  "iv",
  "accountNumber",
];

/**
 * Redacts sensitive fields from an object.
 * @param obj - Object to redact
 * @returns Redacted copy of the object
 */
function redactSensitiveFields(
  obj: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!obj) return undefined;

  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      redacted[key] = "[REDACTED]";
    }
  }
  return redacted;
}

/**
 * Gets client info (IP, user agent) from request headers.
 * @returns Object with ipAddress and userAgent
 */
export async function getClientInfo(): Promise<{
  ipAddress?: string;
  userAgent?: string;
}> {
  try {
    const headersList = await headers();
    return {
      ipAddress:
        headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
        headersList.get("x-real-ip") ||
        undefined,
      userAgent: headersList.get("user-agent") || undefined,
    };
  } catch {
    // Headers may not be available in some contexts
    return {};
  }
}

/**
 * Logs an action to the audit log.
 * 
 * @example
 * // Log a client creation
 * await logAction({
 *   userId: session.user.id,
 *   entityType: "client",
 *   entityId: newClient.id,
 *   action: "create",
 *   metadata: { after: newClient },
 * });
 * 
 * @example
 * // Log a credential decrypt (SOC 2 critical)
 * await logAction({
 *   userId: session.user.id,
 *   entityType: "credential",
 *   entityId: credential.id,
 *   action: "decrypt",
 *   metadata: { context: { label: credential.label } },
 * });
 */
export async function logAction(options: LogActionOptions): Promise<void> {
  const { userId, entityType, entityId, action, metadata } = options;

  // Get client info if not provided
  const clientInfo = metadata?.ipAddress ? {} : await getClientInfo();

  // Prepare metadata with redaction
  const safeMetadata: AuditMetadata = {
    ipAddress: metadata?.ipAddress || clientInfo.ipAddress,
    userAgent: metadata?.userAgent || clientInfo.userAgent,
    before: redactSensitiveFields(metadata?.before),
    after: redactSensitiveFields(metadata?.after),
    context: metadata?.context,
  };

  // Remove undefined values
  Object.keys(safeMetadata).forEach((key) => {
    if (safeMetadata[key as keyof AuditMetadata] === undefined) {
      delete safeMetadata[key as keyof AuditMetadata];
    }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      entityType,
      entityId,
      action,
      metadata: safeMetadata ? JSON.parse(JSON.stringify(safeMetadata)) : undefined,
    },
  });
}

// =============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON AUDIT EVENTS
// =============================================================================

/**
 * Logs a successful login.
 */
export async function logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
  await logAction({
    userId,
    entityType: "session",
    entityId: userId,
    action: "login",
    metadata: { ipAddress, userAgent },
  });
}

/**
 * Logs a logout.
 */
export async function logLogout(userId: string): Promise<void> {
  const clientInfo = await getClientInfo();
  await logAction({
    userId,
    entityType: "session",
    entityId: userId,
    action: "logout",
    metadata: clientInfo,
  });
}

/**
 * Logs a failed login attempt.
 */
export async function logFailedLogin(
  email: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAction({
    userId: null,
    entityType: "session",
    entityId: email,
    action: "failed_login",
    metadata: {
      ipAddress,
      userAgent,
      context: { reason },
    },
  });
}

/**
 * Logs a credential decrypt event.
 */
export async function logCredentialDecrypt(
  userId: string,
  credentialId: string,
  credentialLabel: string
): Promise<void> {
  await logAction({
    userId,
    entityType: "credential",
    entityId: credentialId,
    action: "decrypt",
    metadata: { context: { label: credentialLabel } },
  });
}

/**
 * Logs an entity creation.
 */
export async function logCreate(
  userId: string,
  entityType: AuditEntityType,
  entityId: string,
  data?: Record<string, unknown>
): Promise<void> {
  await logAction({
    userId,
    entityType,
    entityId,
    action: "create",
    metadata: { after: data },
  });
}

/**
 * Logs an entity update.
 */
export async function logUpdate(
  userId: string,
  entityType: AuditEntityType,
  entityId: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>
): Promise<void> {
  await logAction({
    userId,
    entityType,
    entityId,
    action: "update",
    metadata: { before, after },
  });
}

/**
 * Logs an entity deletion.
 */
export async function logDelete(
  userId: string,
  entityType: AuditEntityType,
  entityId: string,
  data?: Record<string, unknown>
): Promise<void> {
  await logAction({
    userId,
    entityType,
    entityId,
    action: "delete",
    metadata: { before: data },
  });
}
