-- Phase 1 multi-vertical feature additions
-- See VitrOS_Multi_Vertical_Feature_Map.md for context.
--
-- All additive (nullable cols or default values), zero-risk migration.
-- Already applied directly to Neon production via MCP on 2026-06-04;
-- this file exists so the Prisma migration history stays clean when
-- `npx prisma migrate dev` is run next.

-- CloneLine: per-population accession (conservation) + clean-stock release status
ALTER TABLE "CloneLine" ADD COLUMN IF NOT EXISTS "collectionSite" TEXT;
ALTER TABLE "CloneLine" ADD COLUMN IF NOT EXISTS "collectionGPS" TEXT;
ALTER TABLE "CloneLine" ADD COLUMN IF NOT EXISTS "voucherRef" TEXT;
ALTER TABLE "CloneLine" ADD COLUMN IF NOT EXISTS "releaseStatus" TEXT;
CREATE INDEX IF NOT EXISTS "CloneLine_organizationId_releaseStatus_idx" ON "CloneLine"("organizationId", "releaseStatus");

-- Cultivar: species/variety/sport hierarchy + breeder attribution
ALTER TABLE "Cultivar" ADD COLUMN IF NOT EXISTS "parentCultivarId" TEXT;
ALTER TABLE "Cultivar" ADD COLUMN IF NOT EXISTS "breederCredit" TEXT;
ALTER TABLE "Cultivar" ADD COLUMN IF NOT EXISTS "trademarkRef" TEXT;
DO $$ BEGIN
    ALTER TABLE "Cultivar" ADD CONSTRAINT "Cultivar_parentCultivarId_fkey"
        FOREIGN KEY ("parentCultivarId") REFERENCES "Cultivar"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "Cultivar_parentCultivarId_idx" ON "Cultivar"("parentCultivarId");

-- Vessel: off-type / somaclonal variation + formal mother plant designation
ALTER TABLE "Vessel" ADD COLUMN IF NOT EXISTS "isOffType" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Vessel" ADD COLUMN IF NOT EXISTS "offTypeNotes" TEXT;
ALTER TABLE "Vessel" ADD COLUMN IF NOT EXISTS "isMotherPlant" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Vessel" ADD COLUMN IF NOT EXISTS "motherPlantNotes" TEXT;
CREATE INDEX IF NOT EXISTS "Vessel_organizationId_isMotherPlant_idx" ON "Vessel"("organizationId", "isMotherPlant");
CREATE INDEX IF NOT EXISTS "Vessel_organizationId_isOffType_idx" ON "Vessel"("organizationId", "isOffType");
