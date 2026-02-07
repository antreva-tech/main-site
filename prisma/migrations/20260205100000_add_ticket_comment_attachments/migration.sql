-- CreateTable
CREATE TABLE "TicketCommentAttachment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketCommentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketCommentAttachment_commentId_idx" ON "TicketCommentAttachment"("commentId");

-- AddForeignKey
ALTER TABLE "TicketCommentAttachment" ADD CONSTRAINT "TicketCommentAttachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "TicketComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
