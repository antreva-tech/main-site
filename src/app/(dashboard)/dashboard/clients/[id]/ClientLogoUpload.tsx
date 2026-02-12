"use client";

/**
 * Upload or remove the client logo (stored in Client.logoUrl, files in Vercel Blob).
 * Shown on the client detail page.
 */

import { useState, useTransition } from "react";
import { uploadClientLogo, updateClientLogo } from "../actions";

type Props = {
  clientId: string;
  logoUrl: string | null;
};

export function ClientLogoUpload({ clientId, logoUrl: initialLogoUrl }: Props) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startUploadTransition(async () => {
      const result = await uploadClientLogo(fd);
      if (result.url) {
        const updateResult = await updateClientLogo(clientId, result.url);
        if (updateResult.error) {
          setError(updateResult.error);
          return;
        }
        setLogoUrl(result.url);
      } else {
        setError(result.error ?? "Upload failed");
      }
    });
    e.target.value = "";
  };

  const handleRemove = () => {
    setError(null);
    startRemoveTransition(async () => {
      const result = await updateClientLogo(clientId, null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLogoUrl(null);
    });
  };

  return (
    <div className="rounded-xl border border-[#0B132B]/[0.08] bg-white/50 p-5">
      <h2 className="text-sm font-semibold text-[#8A8F98] uppercase tracking-wider mb-3">
        Client logo
      </h2>
      <p className="text-xs text-[#8A8F98] mb-3">
        Used on the main website showcase. JPEG, PNG, WebP or SVG, max 2 MB.
      </p>
      {logoUrl ? (
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-[#0B132B]/[0.08]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Client logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-fit">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
              {isUploading ? "Uploading…" : "Replace logo"}
            </label>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 w-fit"
            >
              {isRemoving ? "Removing…" : "Remove logo"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#1C6ED5]/50 rounded-lg text-sm font-medium text-[#1C6ED5] bg-[#1C6ED5]/[0.08] hover:bg-[#1C6ED5]/[0.12] cursor-pointer">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
            {isUploading ? "Uploading…" : "Upload logo"}
          </label>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
