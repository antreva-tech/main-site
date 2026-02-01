/**
 * Server Actions for Tickets
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logCreate, logUpdate } from "@/lib/audit";
import type { TicketStatus, TicketPriority } from "@prisma/client";

/**
 * Creates a new ticket.
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
  return ticket;
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
 * Adds a comment to a ticket.
 */
export async function addComment(ticketId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  if (!content.trim()) throw new Error("Comment cannot be empty");

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId,
      content,
      authorId: session.id,
      authorType: "staff",
    },
  });

  // Update ticket timestamp
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return comment;
}
