// Shared ingest pipeline for supplier order emails. Parses, deduplicates, and
// lands the result in the review queue (status 'pending'). Used by both the
// forwarding endpoint and the scheduled inbox poller.

import { select, insert, insertMany, audit } from './db'
import { parseOrderEmail, type EmailInput } from './order-parsers'
import type { Order } from './types'

export type IngestOutcome =
  | { status: 'created'; order: Order; confidence: number; method: string }
  | { status: 'duplicate'; reason: string }
  | { status: 'error'; error: string }

/** Strip HTML to rough plain text for the parsers. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(p|div|tr|li|h[1-6]|table)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function ingestOrderEmail(
  email: EmailInput,
  messageId: string | null,
): Promise<IngestOutcome> {
  try {
    // 1. Dedupe by message id.
    if (messageId) {
      const existing = await select<Order>('orders', {
        source_email_id: `eq.${messageId}`,
        limit: 1,
      })
      if (existing.length > 0) return { status: 'duplicate', reason: 'message already ingested' }
    }

    // 2. Parse.
    const parsed = await parseOrderEmail(email)

    // 3. Dedupe by supplier + order number.
    if (parsed.orderNumber) {
      const dup = await select<Order>('orders', {
        supplier_name: `ilike.${parsed.supplierName}`,
        order_number: `eq.${parsed.orderNumber}`,
        limit: 1,
      })
      if (dup.length > 0) return { status: 'duplicate', reason: 'order number already logged' }
    }

    // 4. Insert as a pending (review-queue) order. Never auto-confirmed.
    const order = await insert<Order>('orders', {
      supplier_name: parsed.supplierName,
      date: parsed.date,
      source_email_id: messageId,
      order_number: parsed.orderNumber,
      category: parsed.category,
      net: parsed.net,
      vat: parsed.vat,
      total: parsed.total,
      currency: 'GBP',
      paid: false,
      status: 'pending',
      parse_confidence: parsed.confidence,
      raw_source: `${email.subject}\n${email.text}`.slice(0, 8000),
    })

    if (parsed.lines.length > 0) {
      await insertMany('order_lines', parsed.lines.map((l) => ({
        order_id: order.id,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unitPrice,
      })))
    }

    await audit('ingest', 'order', order.id, {
      supplier: parsed.supplierName,
      method: parsed.method,
      confidence: parsed.confidence,
    })

    return { status: 'created', order, confidence: parsed.confidence, method: parsed.method }
  } catch (err) {
    // A duplicate order_number trips the DB unique index — treat as duplicate.
    const msg = err instanceof Error ? err.message : 'ingest failed'
    if (/duplicate key|unique/i.test(msg)) return { status: 'duplicate', reason: 'unique constraint' }
    console.error('[order-ingest] failed', err)
    return { status: 'error', error: msg }
  }
}
