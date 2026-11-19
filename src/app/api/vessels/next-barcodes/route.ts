import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError, ApiError } from "@/lib/api-helpers";
import { nextBarcodesFor } from "@/lib/next-barcodes";
import { MAX_STARTER_VESSELS } from "@/lib/starter-barcodes";

// Proposes numbered barcodes for vessels that have no printed label. Nothing
// is saved here; the vessel create routes still check for duplicates.
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get("count") || "1", 10);
    if (!Number.isInteger(count) || count < 1 || count > MAX_STARTER_VESSELS) {
      throw new ApiError(`count must be from 1 to ${MAX_STARTER_VESSELS}`, 400);
    }
    const reserved = searchParams.getAll("reserved").filter(Boolean).slice(0, 1000);
    const barcodes = await nextBarcodesFor(user.organizationId, count, reserved);
    return NextResponse.json({ barcodes });
  } catch (error) {
    return handleApiError(error);
  }
}
