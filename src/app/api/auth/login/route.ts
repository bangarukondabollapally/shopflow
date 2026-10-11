import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { verifyPassword } from "@/server/auth/password";
import { createDbSession } from "@/server/auth/session";
import { errorResponse } from "@/server/auth/guards";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid email or password format", 422, parsed.error.format());
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse("UNAUTHORIZED", "Invalid email or password", 401);
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse("UNAUTHORIZED", "Invalid email or password", 401);
    }

    await createDbSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return errorResponse("INTERNAL", "Login failed", 500);
  }
}
