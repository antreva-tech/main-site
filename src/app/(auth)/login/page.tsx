/**
 * Login Page for Antreva CRM
 * Handles email/password authentication with MFA support.
 */

"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { loginAction, verifyMfaAction, type LoginState } from "./actions";

/**
 * Login form component with MFA support.
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("from") || "/dashboard";

  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );

  const [mfaState, mfaFormAction, isMfaPending] = useActionState<
    LoginState,
    FormData
  >(verifyMfaAction, { requiresMfa: state.requiresMfa, userId: state.userId });

  // Show MFA form if required
  if (state.requiresMfa || mfaState.requiresMfa) {
    return (
      <MfaForm
        userId={state.userId || mfaState.userId}
        returnUrl={returnUrl}
        error={mfaState.error}
        formAction={mfaFormAction}
        isPending={isMfaPending}
      />
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/Antreva Tech Transparente.png"
            alt="Antreva Tech"
            width={200}
            height={60}
            className="mx-auto"
            priority
          />
          <h1 className="mt-4 text-2xl font-semibold text-white">
            CRM Login
          </h1>
          <p className="mt-2 text-[#8A8F98]">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <form action={formAction} className="bg-white rounded-lg p-8 shadow-xl">
          <input type="hidden" name="returnUrl" value={returnUrl} />

          {/* Error Message */}
          {state.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {state.error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5] focus:border-transparent transition"
              placeholder="you@antreva.com"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5] focus:border-transparent transition"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-[#1C6ED5] text-white font-medium rounded-md hover:bg-[#1559B3] focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[#8A8F98]">
          Antreva Tech - Engineering Digital Intelligence
        </p>
      </div>
    </main>
  );
}

/**
 * Login page wrapper with Suspense for useSearchParams.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

/**
 * Skeleton for login page while search params load.
 */
function LoginPageSkeleton() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4">
      <div className="w-full max-w-md animate-pulse">
        <div className="h-12 bg-gray-700 rounded mb-8" />
        <div className="bg-white rounded-lg p-8 shadow-xl space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </main>
  );
}

/**
 * MFA verification form component.
 */
function MfaForm({
  userId,
  returnUrl,
  error,
  formAction,
  isPending,
}: {
  userId?: string;
  returnUrl: string;
  error?: string;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/Antreva Tech Transparente.png"
            alt="Antreva Tech"
            width={200}
            height={60}
            className="mx-auto"
            priority
          />
          <h1 className="mt-4 text-2xl font-semibold text-white">
            Two-Factor Authentication
          </h1>
          <p className="mt-2 text-[#8A8F98]">
            Enter the code from your authenticator app
          </p>
        </div>

        {/* MFA Form */}
        <form action={formAction} className="bg-white rounded-lg p-8 shadow-xl">
          <input type="hidden" name="userId" value={userId || ""} />
          <input type="hidden" name="returnUrl" value={returnUrl} />

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Code Input */}
          <div className="mb-6">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Authentication Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5] focus:border-transparent transition"
              placeholder="000000"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-[#1C6ED5] text-white font-medium rounded-md hover:bg-[#1559B3] focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Verifying..." : "Verify"}
          </button>
        </form>

        {/* Back Link */}
        <p className="mt-6 text-center">
          <a
            href="/login"
            className="text-[#1C6ED5] hover:underline text-sm"
          >
            Back to login
          </a>
        </p>
      </div>
    </main>
  );
}
