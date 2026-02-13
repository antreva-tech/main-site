/**
 * Logo Upload Route Handler — Vercel Blob client upload flow.
 * Uses handleUpload for secure token generation and upload completion callback.
 *
 * Client calls: upload(file, { handleUploadUrl: '/api/blob/logo-upload', clientPayload })
 * Server handles two events: token generation (auth + RBAC) and completion (DB update).
 */

import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Allowed image MIME types for logo uploads. */
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

/** Maximum logo size: 2 MB. */
const MAX_LOGO_SIZE = 2 * 1024 * 1024;

/**
 * POST handler for Vercel Blob client upload flow.
 * Dispatches to onBeforeGenerateToken (auth) or onUploadCompleted (DB persist).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      /**
       * Called before generating the client token.
       * Authenticates user, validates lead exists, and restricts content types.
       */
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await getSession();
        if (!session) throw new Error("Unauthorized");

        // RBAC: require leads.write permission
        if (!hasPermission(session, "leads.write")) {
          throw new Error("Permission denied: leads.write");
        }

        // Parse entityId from client payload
        let entityId: string | null = null;
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload) as { entityId?: string };
            entityId = parsed.entityId ?? null;
          } catch {
            // Ignore parse errors; entityId will be null
          }
        }

        if (!entityId) {
          throw new Error("Missing entityId in clientPayload");
        }

        // Validate lead exists
        const lead = await prisma.lead.findUnique({
          where: { id: entityId },
          select: { id: true },
        });
        if (!lead) throw new Error("Lead not found");

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_LOGO_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ entityId, userId: session.id }),
        };
      },

      /**
       * Called by Vercel Blob after the client upload completes.
       * Persists blob metadata to the Lead record.
       */
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;

        const { entityId } = JSON.parse(tokenPayload) as {
          entityId: string;
          userId: string;
        };

        await prisma.lead.update({
          where: { id: entityId },
          data: {
            hasLogo: true,
            logoBlobUrl: blob.url,
            logoDownloadUrl: blob.downloadUrl,
            logoPathname: blob.pathname,
            logoContentType: blob.contentType,
          },
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
