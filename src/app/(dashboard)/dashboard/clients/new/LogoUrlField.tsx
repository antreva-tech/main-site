"use client";

/**
 * Logo URL input with optional upload to Vercel Blob (for New Client form).
 */

import { useState, useTransition } from "react";
import { uploadClientLogo } from "../actions";

export function LogoUrlField() {
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startTransition] = useTransition();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadClientLogo(fd);
      if (result.url) setLogoUrl(result.url);
      else setError(result.error ?? "Upload failed");
    });
    e.target.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Logo (showcase card)
      </label>
      <input
        type="url"
        name="logoUrl"
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
        placeholder="Paste URL or upload below"
      />
      <div className="mt-2 flex items-center gap-2">
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleUpload}
            disabled={isUploading}
            className="sr-only"
          />
          {isUploading ? "Uploading…" : "Upload to Vercel Blob"}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
