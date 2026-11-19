import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, handleApiError, parseBody, ApiError } from "@/lib/api-helpers";
import { checkVesselLimit } from "@/lib/plan-limits";
import { STAGES } from "@/lib/constants";
import { barcodePrefix, nextBarcodes, MAX_STARTER_VESSELS } from "@/lib/starter-barcodes";

const firstVesselsSchema = z.object({
  cultivarName: z.string().trim().min(1, "Tell us what you are growing").max(120),
  count: z.number().int().min(1).max(MAX_STARTER_VESSELS),
  stage: z.enum(STAGES).default("multiplication"),
});

// Logs a new lab's first vessels in one step: no barcode labels, site,
// location or media recipe required. Barcodes are generated.
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await parseBody(req, firstVesselsSchema);
    await checkVesselLimit(user.organizationId, body.count);

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true },
    });
    if (!org) throw new ApiError("Organization not found", 404);

    const cultivar =
      (await prisma.cultivar.findFirst({
        where: { organizationId: user.organizationId, name: { equals: body.cultivarName, mode: "insensitive" } },
      })) ??
      (await prisma.cultivar.create({
        data: { name: body.cultivarName, species: "", cultivarType: "in_house", organizationId: user.organizationId },
      }));

    const prefix = barcodePrefix(org.name);
    let created: { id: string; barcode: string }[] = [];
    // A teammate could take a number between the read and the write, so retry
    // once on a unique-constraint failure.
    for (let attempt = 0; attempt < 2; attempt++) {
      const taken = await prisma.vessel.findMany({
        where: { organizationId: user.organizationId, barcode: { startsWith: `${prefix}-` } },
        select: { barcode: true },
      });
      const barcodes = nextBarcodes(prefix, taken.map((v) => v.barcode), body.count);
      try {
        created = await prisma.vessel.createManyAndReturn({
          data: barcodes.map((barcode) => ({
            barcode,
            cultivarId: cultivar.id,
            explantCount: 0,
            healthStatus: "healthy",
            status: "growing",
            stage: body.stage,
            organizationId: user.organizationId,
          })),
          select: { id: true, barcode: true },
        });
        break;
      } catch (error) {
        const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!duplicate || attempt === 1) throw error;
      }
    }

    await prisma.activity.createMany({
      data: created.map((vessel) => ({
        vesselId: vessel.id,
        userId: user.id,
        type: "created",
        category: "vessel",
        newState: { status: "growing", stage: body.stage, healthStatus: "healthy" },
        notes: `Vessel ${vessel.barcode} created during setup`,
      })),
    });

    return NextResponse.json(
      { cultivar: { id: cultivar.id, name: cultivar.name }, count: created.length, barcodes: created.map((v) => v.barcode) },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
