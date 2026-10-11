import { prisma } from "@/server/db";

export async function peekNextTicketId(tx?: any): Promise<string> {
  const client = tx || prisma;
  try {
    const res = (await client.$queryRawUnsafe(
      `SELECT 'RIT-2026-' || LPAD((last_value + 1)::text, 6, '0') as next_preview FROM refund_ticket_seq;`
    )) as Array<{ next_preview: string }>;
    if (res[0]?.next_preview) return res[0].next_preview;
  } catch {}

  const existing = await client.refundTicket.findMany({ select: { id: true } });
  let maxNum = 122;
  for (const t of existing) {
    const match = t.id.match(/^RIT-2026-(\d+)$/);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val > maxNum) maxNum = val;
    }
  }
  return `RIT-2026-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function getNextTicketId(tx?: any): Promise<string> {
  const client = tx || prisma;
  try {
    const res = (await client.$queryRawUnsafe(
      `SELECT nextval('refund_ticket_seq')::text as next_val;`
    )) as Array<{ next_val: string }>;
    const num = parseInt(res[0]?.next_val || "123", 10);
    return `RIT-2026-${String(num).padStart(6, "0")}`;
  } catch {
    const preview = await peekNextTicketId(client);
    return preview;
  }
}
