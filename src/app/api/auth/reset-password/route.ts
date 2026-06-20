import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(await req.json());

    // Look up the token. Stored against the namespaced password-reset identifier.
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (
      !record ||
      !record.identifier.startsWith("password-reset:") ||
      record.expires < new Date()
    ) {
      // Clean up an expired/used token if present.
      if (record) {
        await prisma.verificationToken.deleteMany({ where: { token } });
      }
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const email = record.identifier.slice("password-reset:".length);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    // Mirror the bcrypt hashing used in change-password (cost factor 12).
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Consume the token (single-use) plus any other reset tokens for this user.
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => i.message);
      return NextResponse.json({ error: messages.join("; ") }, { status: 400 });
    }
    console.error("[ResetPassword] Error:", error);
    return NextResponse.json(
      { error: "Could not reset password. Please try again." },
      { status: 500 },
    );
  }
}
