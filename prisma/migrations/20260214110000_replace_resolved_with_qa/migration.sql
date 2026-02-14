-- Add 'qa' to TicketStatus enum
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'qa';

-- Migrate existing tickets from resolved to qa
UPDATE "Ticket" SET status = 'qa' WHERE status = 'resolved';
