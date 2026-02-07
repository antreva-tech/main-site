-- Run this in Neon SQL Editor if you see "table TicketCommentAttachment does not exist".
-- Creates the table for comment image uploads. After running, re-enable comment attachments
-- in src/app/(dashboard)/dashboard/tickets/[id]/page.tsx (include attachments + render block).

-- CreateTable
CREATE TABLE IF NOT EXISTS "TicketCommentAttachment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketCommentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TicketCommentAttachment_commentId_idx" ON "TicketCommentAttachment"("commentId");

-- AddForeignKey (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TicketCommentAttachment_commentId_fkey'
  ) THEN
    ALTER TABLE "TicketCommentAttachment"
    ADD CONSTRAINT "TicketCommentAttachment_commentId_fkey"
    FOREIGN KEY ("commentId") REFERENCES "TicketComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
