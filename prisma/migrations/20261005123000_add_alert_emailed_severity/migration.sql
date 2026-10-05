-- Record the severity of the last successful email so a failed critical
-- escalation is retried instead of hiding behind the earlier warning send
ALTER TABLE "Alert" ADD COLUMN "emailedSeverity" TEXT;
