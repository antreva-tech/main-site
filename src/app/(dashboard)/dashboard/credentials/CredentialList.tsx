/**
 * Credential List Component
 * Renders per-client credentials with Decrypt/Hide and optional copy for decrypted value.
 */

"use client";

import { useState, useTransition } from "react";
import { decryptCredential } from "./actions";

interface Credential {
  id: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Formats relative time for "Updated X ago" (e.g. "2 days ago").
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function CredentialList({
  clientId,
  credentials,
}: {
  clientId: string;
  credentials: Credential[];
}) {
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDecrypt = async (credentialId: string, label: string) => {
    if (decrypted[credentialId]) {
      setDecrypted((prev) => {
        const next = { ...prev };
        delete next[credentialId];
        return next;
      });
      return;
    }

    setDecryptingId(credentialId);
    startTransition(async () => {
      try {
        const value = await decryptCredential(credentialId, label);
        setDecrypted((prev) => ({ ...prev, [credentialId]: value }));
      } catch {
        alert("Failed to decrypt credential");
      }
      setDecryptingId(null);
    });
  };

  const handleCopy = async (credentialId: string) => {
    const value = decrypted[credentialId];
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(credentialId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <ul className="divide-y divide-[#0B132B]/08 dark:divide-white/10" role="list">
      {credentials.map((cred) => {
        const isDecrypted = !!decrypted[cred.id];
        const isDecrypting = isPending && decryptingId === cred.id;

        return (
          <li
            key={cred.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#0B132B] dark:text-gray-100">{cred.label}</p>
              <p className="mt-0.5 text-xs text-[#8A8F98] dark:text-gray-400">
                Updated {formatRelativeTime(cred.updatedAt)}
              </p>
              {isDecrypted && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code className="block max-w-full rounded-lg border border-[#0B132B]/12 dark:border-white/15 bg-[#0B132B]/[0.03] dark:bg-white/[0.06] px-3 py-2 font-mono text-sm break-all text-[#0B132B] dark:text-gray-200">
                    {decrypted[cred.id]}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(cred.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B132B]/15 dark:border-white/20 bg-white dark:bg-white/10 px-3 py-2 text-xs font-medium text-[#0B132B] dark:text-gray-100 hover:bg-[#0B132B]/05 dark:hover:bg-white/15 transition-colors"
                    aria-label="Copy credential value"
                  >
                    {copiedId === cred.id ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => handleDecrypt(cred.id, cred.label)}
                disabled={isDecrypting}
                className={
                  isDecrypted
                    ? "rounded-xl border border-[#0B132B]/15 dark:border-white/20 bg-white dark:bg-white/10 px-4 py-2.5 text-sm font-medium text-[#8A8F98] dark:text-gray-400 hover:bg-[#0B132B]/05 dark:hover:bg-white/15 transition-colors disabled:opacity-50"
                    : "rounded-xl bg-[#1C6ED5] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1559B3] transition-colors disabled:opacity-50"
                }
                aria-busy={isDecrypting}
                aria-label={isDecrypted ? "Hide credential" : "Decrypt credential"}
              >
                {isDecrypting ? "Decrypting…" : isDecrypted ? "Hide" : "Decrypt"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
