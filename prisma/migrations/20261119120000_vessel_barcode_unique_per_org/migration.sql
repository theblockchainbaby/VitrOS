-- Barcodes were unique across every organization, so a second lab typing a
-- common code like "001" hit a database error. Make them unique per lab.
DROP INDEX IF EXISTS "Vessel_barcode_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Vessel_organizationId_barcode_key" ON "Vessel"("organizationId", "barcode");
