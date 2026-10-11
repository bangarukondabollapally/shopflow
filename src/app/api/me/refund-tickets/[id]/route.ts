import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireAuth, errorResponse } from "@/server/auth/guards";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(["CUSTOMER", "ADMIN", "SUPPORT_ANALYST"]);
  if (error || !user) return error;

  try {
    const ticket = await prisma.refundTicket.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true, sku: true },
        },
        order: {
          select: { id: true, orderedAt: true, deliveredAt: true },
        },
        evidence: {
          select: { id: true, type: true, filename: true, storedPath: true, mime: true },
        },
        refundTransactions: {
          select: { id: true, amountMinor: true, status: true, settleAt: true, createdAt: true },
        },
      },
    });

    if (!ticket) {
      return errorResponse("NOT_FOUND", "Refund ticket not found", 404);
    }

    if (user.role === "CUSTOMER" && ticket.customerId !== user.id) {
      return errorResponse("FORBIDDEN", "You do not own this ticket", 403);
    }

    // Load audit events for customer timeline
    const auditEvents = await prisma.auditEvent.findMany({
      where: { entityType: "REFUND_TICKET", entityId: ticket.id },
      orderBy: { createdAt: "asc" },
    });

    // Friendly timeline mapping strictly without internal scores/traces
    const timeline = auditEvents.map((ae) => {
      let title = "Ticket Event";
      let description = "Status updated";

      if (ae.event === "TICKET_CREATED") {
        title = "Ticket Submitted";
        description = "Your refund request was received and submitted for review.";
      } else if (ae.event === "RITOS_PROCESSING_STARTED") {
        title = "Under Orchestration";
        description = "Automated policy and order verification is underway.";
      } else if (ae.event === "DECISION_RECORDED") {
        const payload = ae.payload as any;
        if (payload?.decision === "APPROVED") {
          title = "Refund Approved";
          description = `Approved for ₹${((payload.amount_minor || ticket.requestedAmountMinor) / 100).toLocaleString("en-IN")}.`;
        } else if (payload?.decision === "REJECTED") {
          title = "Request Rejected";
          description = payload?.reason || "Refund request did not meet return policy requirements.";
        } else if (payload?.decision === "HUMAN_REVIEW") {
          title = "Additional Verification";
          description = "Your request has been routed to our customer support team for review.";
        }
      } else if (ae.event === "REFUND_EXECUTED") {
        title = "Refund Initiated";
        description = "Payout initiated to your original payment method. Expected credit: 2-5 business days.";
      } else if (ae.event === "REFUND_COMPLETED") {
        title = "Refund Settled";
        description = "Payout settled successfully.";
      }

      return {
        event: ae.event,
        title,
        description,
        occurred_at: ae.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticket_number: ticket.id,
        status: ticket.status,
        reason: ticket.reason,
        requested_action: ticket.requestedAction,
        requested_amount_minor: ticket.requestedAmountMinor,
        description: ticket.description,
        created_at: ticket.createdAt.toISOString(),
        product: ticket.product,
        order: ticket.order,
        evidence: ticket.evidence,
        refund_transactions: ticket.refundTransactions,
        timeline,
      },
    });
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Failed to load ticket", 500);
  }
}
