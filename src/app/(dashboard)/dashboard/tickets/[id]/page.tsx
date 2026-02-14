/**
 * Ticket Detail Page with Comments
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getAssignableUsers } from "../actions";
import { formatDateTime } from "@/lib/date";
import { TicketStatusSelect } from "./TicketStatusSelect";
import { CommentForm } from "./CommentForm";
import { TicketCommentItem } from "./TicketCommentItem";

/**
 * Ticket detail page.
 */
export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, ticket, assignableUsers] = await Promise.all([
    getSession(),
    prisma.ticket.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { name: true } },
        createdBy: { select: { name: true } },
        attachments: { orderBy: { createdAt: "asc" } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { name: true } },
          },
        },
      },
    }),
    getAssignableUsers(),
  ]);
  const currentUserId = session?.id ?? null;

  if (!ticket) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/dashboard/tickets"
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← Back to Tickets
        </Link>
      </div>

      {/* Header */}
      <div className="dashboard-card p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 break-words">{ticket.subject}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm truncate sm:whitespace-normal">
              <Link
                href={`/dashboard/clients/${ticket.client.id}`}
                className="text-[#1C6ED5] hover:underline"
              >
                {ticket.client.name}
              </Link>
              {" · "}
              <span className="truncate sm:inline">{ticket.client.email}</span>
            </p>
          </div>
          <TicketStatusSelect
            ticketId={ticket.id}
            currentStatus={ticket.status}
            assignedToId={ticket.assignedToId}
            assignableUsers={assignableUsers}
          />
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-900 dark:text-gray-200">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Priority:</span>{" "}
            <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Assigned:</span>{" "}
            <span>{ticket.assignedTo?.name || "Unassigned"}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Created by:</span>{" "}
            <span>{ticket.createdBy.name}</span>
          </div>
        </div>

        {/* Attachments */}
        {ticket.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Attachments ({ticket.attachments.length})</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {ticket.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-[#1C6ED5] transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt="Ticket attachment"
                    className="h-20 w-20 object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="dashboard-card p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Comments ({ticket.comments.length})
        </h2>

        {ticket.comments.length > 0 ? (
          <div className="space-y-4">
            {ticket.comments.map((comment, index) => (
              <TicketCommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                isOriginalComment={index === 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            No comments yet
          </p>
        )}

        {/* Add Comment */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-600">
          <CommentForm ticketId={ticket.id} />
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-400 dark:text-gray-500">
        <p>Created: {formatDateTime(ticket.createdAt)}</p>
        <p>Updated: {formatDateTime(ticket.updatedAt)}</p>
        {ticket.resolvedAt && <p>Resolved: {formatDateTime(ticket.resolvedAt)}</p>}
        <p>ID: {ticket.id}</p>
      </div>
    </div>
  );
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "text-gray-600 dark:text-gray-400",
    medium: "text-blue-600 dark:text-blue-400",
    high: "text-orange-600 dark:text-orange-400",
    urgent: "text-red-600 dark:text-red-400 font-semibold",
  };
  return colors[priority] || colors.medium;
}
