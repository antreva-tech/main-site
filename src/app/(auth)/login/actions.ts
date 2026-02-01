/**
 * Server Actions for Login Page
 * Handles authentication flow including MFA.
 */

"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { login, completeMfaLogin, setSessionCookie } from "@/lib/auth";
import { logLogin, logFailedLogin } from "@/lib/audit";

/**
 * Login form state
 */
export interface LoginState {
  error?: string;
  requiresMfa?: boolean;
  userId?: string;
}

/**
 * Handles initial login (email + password).
 */
export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const returnUrl = (formData.get("returnUrl") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Get client info for audit
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    undefined;
  const userAgent = headersList.get("user-agent") || undefined;

  const result = await login(email, password, ipAddress, userAgent);

  if (!result.success) {
    // Log failed attempt
    await logFailedLogin(email, result.error, ipAddress, userAgent);

    if (result.requiresMfa) {
      // MFA required - return state for second step
      return {
        requiresMfa: true,
        userId: result.user?.id,
      };
    }

    return { error: result.error };
  }

  // Success - set session cookie and redirect
  if (result.token) {
    await setSessionCookie(result.token);
    await logLogin(result.user!.id, ipAddress, userAgent);
  }

  redirect(returnUrl);
}

/**
 * Handles MFA verification step.
 */
export async function verifyMfaAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = formData.get("userId") as string;
  const code = formData.get("code") as string;
  const returnUrl = (formData.get("returnUrl") as string) || "/dashboard";

  if (!userId || !code) {
    return { error: "MFA code is required", requiresMfa: true, userId };
  }

  // Get client info
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    undefined;
  const userAgent = headersList.get("user-agent") || undefined;

  const result = await completeMfaLogin(userId, code, ipAddress, userAgent);

  if (!result.success) {
    return { error: result.error, requiresMfa: true, userId };
  }

  // Success
  if (result.token) {
    await setSessionCookie(result.token);
    await logLogin(result.user!.id, ipAddress, userAgent);
  }

  redirect(returnUrl);
}
