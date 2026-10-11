import { prisma } from "@/server/db";
import { buildRefundContext } from "@/server/ritos/context-builder";
import { mockDecide } from "@/server/mock-ritos/mock-decide";

export async function processOutboxBatch(limit = 10) {
  const pendingEvents = await prisma.integrationEvent.findMany({
    where: { status: "PENDING" },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  const results: Array<{ id: string; status: string; error?: string }> = [];

  for (const event of pendingEvents) {
    try {
      if (process.env.MOCK_RITOS !== "false") {
        // Direct mock dispatch
        if (event.eventType === "refund.ticket.created") {
          const context = await buildRefundContext(event.ticketId);
          if (context) {
            const decision = mockDecide(context);

            const baseUrl = process.env.SHOPFLOW_BASE_URL || "http://localhost:3000";
            const apiKey = process.env.RITOS_API_KEY || "test-ritos-api-key";

            const res = await fetch(`${baseUrl}/api/ritos/refund-decision`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "Idempotency-Key": `mock-decision-${event.id}`,
              },
              body: JSON.stringify(decision),
            });

            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Mock decision callback failed: ${res.status} ${text}`);
            }
          }
        }

        await prisma.integrationEvent.update({
          where: { id: event.id },
          data: { status: "SENT", sentAt: new Date(), attempts: event.attempts + 1 },
        });

        results.push({ id: event.id, status: "SENT" });
      } else {
        // Real RITOS Webhook posting
        const webhookUrl = `${process.env.RITOS_BASE_URL}/webhooks/shopflow`;
        // In real mode post HMAC signed request
        results.push({ id: event.id, status: "PENDING_REAL_RITOS" });
      }
    } catch (err: any) {
      await prisma.integrationEvent.update({
        where: { id: event.id },
        data: {
          status: event.attempts >= 4 ? "FAILED" : "PENDING",
          attempts: event.attempts + 1,
          lastError: err.message || "Failed to dispatch outbox event",
        },
      });
      results.push({ id: event.id, status: "RETRY", error: err.message });
    }
  }

  return results;
}
