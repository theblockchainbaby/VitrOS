import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, handleApiError, parseBody } from "@/lib/api-helpers";
import { updateUserSchema } from "@/lib/validations";
import { assertNotDemoAccount } from "@/lib/demo-account";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    requireRole(currentUser, "admin", "manager");
    assertNotDemoAccount(currentUser, "change team members");
    const { id } = await params;
    const body = await parseBody(req, updateUserSchema);

    const existing = await prisma.user.findFirst({
      where: { id, organizationId: currentUser.organizationId },
    });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
