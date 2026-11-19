import { prisma } from "./prisma";
import { ApiError } from "./api-helpers";
import { barcodePrefix, nextBarcodes } from "./starter-barcodes";

// The next unused numbered barcodes for a lab (for vessels with no printed
// label). `reserved` holds codes the client has proposed but not saved yet, so
// asking twice in one form does not hand out the same number.
export async function nextBarcodesFor(organizationId: string, count: number, reserved: string[] = []): Promise<string[]> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { name: true } });
  if (!org) throw new ApiError("Organization not found", 404);
  const prefix = barcodePrefix(org.name);
  const taken = await prisma.vessel.findMany({
    where: { organizationId, barcode: { startsWith: `${prefix}-` } },
    select: { barcode: true },
  });
  return nextBarcodes(prefix, [...taken.map((v) => v.barcode), ...reserved], count);
}
