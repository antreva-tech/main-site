/**
 * Server Actions for Tickets
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logCreate, logUpdate, logDelete } from "@/lib/audit";
import type { TicketStatus, TicketPriority } from "@prisma/client";

/** Allowed image types for ticket attachments (Vercel Blob). */
const ATTACHMENT_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image

/**
 * Uploads a ticket attachment image to Vercel Blob. Returns URL or null on failure.
 */
async function uploadTicketImage(file: File): Promise<string | null> {
  const type = (file.type || "").toLowerCase();
  if (!ATTACHMENT_CONTENT_TYPES.includes(type) || file.size > ATTACHMENT_MAX_BYTES) {
    return null;
  }
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const slug = file.name.replace(/\.[^.]+$/, "").replace(/\W+/g, "-").slice(0, 40) || "img";
    const pathname = `ticket-attachments/${Date.now()}-${slug}.${ext}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return blob.url;
  } catch {
    return null;
  }
}

/**
 * Creates a new ticket. Accepts optional multiple images via form field "attachments".
 */
export async function createTicket(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const clientId = formData.get("clientId") as string;
  const subject = formData.get("subject") as string;
  const priority = (formData.get("priority") as TicketPriority) || "medium";
  const content = formData.get("content") as string;

  if (!clientId || !subject) throw new Error("Client and subject are required");

  const ticket = await prisma.ticket.create({
    data: {
      clientId,
      subject,
      priority,
      status: "open",
      createdById: session.id,
    },
  });

  // Upload attachment images and create records
  const fileEntries = formData.getAll("attachments").filter((f): f is File => f instanceof File);
  for (const file of fileEntries) {
    const url = await uploadTicketImage(file);
    if (url) {
      await prisma.ticketAttachment.create({
        data: { ticketId: ticket.id, url },
      });
    }
  }

  // Add initial comment if content provided
  if (content) {
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        content,
        authorId: session.id,
        authorType: "staff",
      },
    });
  }

  await logCreate(session.id, "ticket", ticket.id, { clientId, subject });

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/tickets/${ticket.id}`);
}

/**
 * Updates ticket status.
 */
export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket not found");

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status,
      resolvedAt: status === "resolved" || status === "closed" ? new Date() : null,
    },
  });

  await logUpdate(session.id, "ticket", ticketId,
    { status: ticket.status },
    { status }
  );

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return updated;
}

/**
 * Returns active users for ticket assignment dropdown.
 */
export async function getAssignableUsers(): Promise<{ id: string; name: string }[]> {
  const session = await getSession();
  if (!session) return [];

  const users = await prisma.user.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return users;
}

/**
 * Assigns ticket to a user.
 */
export async function assignTicket(ticketId: string, userId: string | null) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket not found");

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assignedToId: userId,
      status: userId && ticket.status === "open" ? "in_progress" : ticket.status,
    },
  });

  await logUpdate(session.id, "ticket", ticketId,
    { assignedToId: ticket.assignedToId },
    { assignedToId: userId }
  );

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return updated;
}

/**
 * Uploads a comment attachment image to Vercel Blob. Returns URL or null on failure.
 */
async function uploadCommentImage(file: File): Promise<string | null> {
  const type = (file.type || "").toLowerCase();
  if (!ATTACHMENT_CONTENT_TYPES.includes(type) || file.size > ATTACHMENT_MAX_BYTES) {
    return null;
  }
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const slug = file.name.replace(/\.[^.]+$/, "").replace(/\W+/g, "-").slice(0, 40) || "img";
    const pathname = `ticket-comment-attachments/${Date.now()}-${slug}.${ext}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return blob.url;
  } catch {
    return null;
  }
}

/**
 * Adds a comment to a ticket. Accepts FormData with "content" and optional "attachments" (files).
 * Either content or at least one image is required.
 */
export async function addComment(ticketId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const content = (formData.get("content") as string)?.trim() ?? "";
  const fileEntries = formData.getAll("attachments").filter((f): f is File => f instanceof File);

  if (!content && fileEntries.length === 0) {
    throw new Error("Comment cannot be empty");
  }

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId,
      content: content || "(image)",
      authorId: session.id,
      authorType: "staff",
    },
  });

  for (const file of fileEntries) {
    const url = await uploadCommentImage(file);
    if (url) {
      try {
        await prisma.ticketCommentAttachment.create({
          data: { commentId: comment.id, url },
        });
      } catch (e) {
        // P2021 = table does not exist (migration not applied); comment still saved
        if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code !== "P2021") throw e;
      }
    }
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return comment;
}

/**
 * Updates a comment. Only the comment author can edit their own comment.
 */
export async function updateComment(commentId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const comment = await prisma.ticketComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== session.id) throw new Error("You can only edit your own comments");
  if (comment.authorType !== "staff") throw new Error("Only staff comments can be edited");

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Comment cannot be empty");

  const updated = await prisma.ticketComment.update({
    where: { id: commentId },
    data: { content: trimmed },
  });

  await logUpdate(session.id, "ticket", comment.ticketId, { commentId, content: comment.content }, { content: trimmed });
  await prisma.ticket.update({
    where: { id: comment.ticketId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/dashboard/tickets/${comment.ticketId}`);
  return updated;
}

/**
 * Deletes a comment. Only the comment author can delete their own comment.
 * The original comment (first on the ticket) cannot be deleted.
 */
export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const comment = await prisma.ticketComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== session.id) throw new Error("You can only delete your own comments");
  if (comment.authorType !== "staff") throw new Error("Only staff comments can be deleted");

  const ticketId = comment.ticketId;
  const oldestComment = await prisma.ticketComment.findFirst({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (oldestComment?.id === commentId) {
    throw new Error("You cannot delete the original comment that opened the ticket");
  }
  await prisma.ticketComment.delete({ where: { id: commentId } });
  await logDelete(session.id, "ticket", ticketId, { commentId, content: comment.content });
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}
