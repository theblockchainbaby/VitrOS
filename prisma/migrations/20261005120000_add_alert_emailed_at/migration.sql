-- Track last successful email submission per alert, separately from row creation
ALTER TABLE "Alert" ADD COLUMN "emailedAt" TIMESTAMP(3);
