/**
 * Credential List Component with Decrypt Functionality
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

  const handleDecrypt = async (credentialId: string, label: string) => {
    if (decrypted[credentialId]) {
      // Toggle hide
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
      } catch (error) {
        alert("Failed to decrypt credential");
      }
      setDecryptingId(null);
    });
  };

  return (
    <div className="space-y-2">
      {credentials.map((cred) => (
        <div
          key={cred.id}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">{cred.label}</p>
            {decrypted[cred.id] && (
              <p className="mt-1 font-mono text-sm bg-white px-2 py-1 rounded border break-all">
                {decrypted[cred.id]}
              </p>
            )}
          </div>
          <button
            onClick={() => handleDecrypt(cred.id, cred.label)}
            disabled={isPending && decryptingId === cred.id}
            className="px-3 py-2 sm:py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 flex-shrink-0 min-h-[44px] sm:min-h-0"
          >
            {isPending && decryptingId === cred.id
              ? "Decrypting..."
              : decrypted[cred.id]
                ? "Hide"
                : "Decrypt"}
          </button>
        </div>
      ))}
    </div>
  );
}
