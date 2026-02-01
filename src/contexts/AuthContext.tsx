/**
 * Authentication Context for Antreva CRM
 * Provides session user data and permission helpers to client components.
 */

"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";

/**
 * Auth context value type.
 */
interface AuthContextValue {
  /** Current authenticated user */
  user: SessionUser;
  /** Check if user has a permission */
  hasPermission: (permission: string) => boolean;
  /** Check if user has any of the permissions */
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth provider component.
 * Wraps dashboard to provide user context.
 */
export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const value: AuthContextValue = {
    user,
    hasPermission: (permission: string) => user.permissions.includes(permission),
    hasAnyPermission: (permissions: string[]) =>
      permissions.some((p) => user.permissions.includes(p)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
