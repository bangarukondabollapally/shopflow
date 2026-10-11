import { NextResponse } from "next/server";
import { requireRitosAuth, errorResponse } from "@/server/auth/ritos-guard";
import { buildRefundContext } from "@/server/ritos/context-builder";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { ticketId: string } }) {
  const { error } = requireRitosAuth(req);
  if (error) return error;

  try {
    const context = await buildRefundContext(params.ticketId);
    if (!context) {
      return errorResponse("NOT_FOUND", `No ticket ${params.ticketId}`, 404);
    }

    return NextResponse.json(context);
  } catch (err: any) {
    return errorResponse("INTERNAL", err.message || "Failed to generate context", 500);
  }
}
