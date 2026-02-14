-- AlterEnum: add 'review' to TicketStatus (PostgreSQL)
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'review';
