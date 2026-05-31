// Stock & reorder review: looks at upcoming booked treatments against the stock
// logged from supplier deliveries, and flags what to order in time for the
// next-day (order before 3pm) delivery cutoff.

import { select } from './db'
import { matchTreatmentType } from './treatment-types'

// The injectable items that come from the supplier and need reordering.
// `match` is matched (case-insensitively) against logged batch product names.
// `perTreatment` is a rough amount used per treatment, in the same unit the
// stock is logged in (toxin in units; the rest counted per syringe/vial), used
// to judge whether the logged stock will cover the upcoming bookings.
const STOCK_ITEMS: Record<string, { item: string; match: RegExp; perTreatment: number; unit: string }> = {
  'anti-wrinkle': { item: 'Anti-wrinkle toxin', match: /botox|azzalure|bocouture|toxin/i, perTreatment: 40, unit: 'units' },
  'dermal-filler': { item: 'Dermal filler', match: /filler|juvederm|restylane|harmonyca/i, perTreatment: 1, unit: 'syringes' },
  'skin-booster': { item: 'Profhilo / skin booster', match: /profhilo|booster/i, perTreatment: 1, unit: 'syringes' },
  'polynucleotides': { item: 'Polynucleotides', match: /polynucleotide|plinest|nucleofill/i, perTreatment: 1, unit: 'vials' },
}

type ApptRow = { client_name: string; service_name: string; date: string }
type BatchRow = { product_name: string; batch_number: string; expiry: string | null; quantity_in: number; quantity_used: number }

export type StockLine = {
  key: string
  item: string
  upcoming: number
  soonestDate: string
  daysUntil: number
  clients: { name: string; date: string }[]
  inStock: boolean
  ordered: boolean // marked ordered, awaiting delivery
  stockNote: string
  needOrder: boolean
  urgent: boolean // booked within the next-day window — order by 3pm today
}

export type StockReview = {
  lines: StockLine[]
  urgentItems: string[]
  beforeCutoff: boolean // is it still before 3pm today
}

export async function stockReview(horizonDays = 14): Promise<StockReview | null> {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const horizon = new Date(now)
  horizon.setDate(horizon.getDate() + horizonDays)
  const tomorrowISO = tomorrow.toISOString().slice(0, 10)
  const horizonISO = horizon.toISOString().slice(0, 10)
  const todayISO = now.toISOString().slice(0, 10)

  try {
    // Items marked ordered in the last 4 days count as handled until delivery.
    const since = new Date(now.getTime() - 4 * 86400000).toISOString()
    const [appts, batches, marks] = await Promise.all([
      select<ApptRow>('appointments', {
        status: 'eq.booked',
        and: `(date.gte.${tomorrowISO},date.lte.${horizonISO})`,
        select: 'client_name,service_name,date',
        order: 'date.asc',
        limit: 500,
      }),
      select<BatchRow>('batches', {
        select: 'product_name,batch_number,expiry,quantity_in,quantity_used',
        limit: 500,
      }),
      select<{ item_key: string }>('reorder_marks', { ordered_at: `gte.${since}`, select: 'item_key', limit: 100 }),
    ])
    const orderedKeys = new Set(marks.map((m) => m.item_key))

    // Demand per stock item from upcoming booked treatments (with who's booked).
    const demand = new Map<string, ApptRow[]>()
    for (const a of appts) {
      const t = matchTreatmentType(a.service_name)
      if (!t || !STOCK_ITEMS[t]) continue
      const cur = demand.get(t)
      if (cur) cur.push(a)
      else demand.set(t, [a])
    }

    const lines: StockLine[] = []
    const urgentItems: string[] = []

    for (const [key, rows] of demand) {
      const def = STOCK_ITEMS[key]
      const soonest = rows.reduce((m, r) => (r.date < m ? r.date : m), rows[0].date)
      // Usable stock: logged batches matching the item, not expired before the booking.
      const usable = batches.filter(
        (b) =>
          def.match.test(b.product_name || '') &&
          (Number(b.quantity_in) - Number(b.quantity_used)) > 0 &&
          (!b.expiry || b.expiry >= soonest),
      )
      const onHand = usable.reduce((s, b) => s + (Number(b.quantity_in) - Number(b.quantity_used)), 0)
      const need = rows.length * def.perTreatment
      // "In stock" only if what's logged actually covers the upcoming bookings.
      const covers = onHand >= need
      const ordered = !covers && orderedKeys.has(key)
      const stockNote = covers
        ? `~${onHand} ${def.unit} in stock, enough for the ${rows.length} booked`
        : ordered
          ? 'Ordered, awaiting delivery'
          : onHand > 0
            ? `Only ~${onHand} ${def.unit} logged; ${rows.length} booked need about ${need}`
            : 'No stock logged'

      const daysUntil = Math.max(0, Math.round((new Date(soonest).getTime() - new Date(todayISO).getTime()) / 86400000))
      const inStock = covers
      const needOrder = !covers && !ordered
      const urgent = needOrder && daysUntil <= 1

      if (urgent) urgentItems.push(def.item)
      lines.push({
        key,
        item: def.item,
        upcoming: rows.length,
        soonestDate: soonest,
        daysUntil,
        clients: rows.map((r) => ({ name: r.client_name, date: r.date })),
        inStock,
        ordered,
        stockNote,
        needOrder,
        urgent,
      })
    }

    lines.sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.daysUntil - b.daysUntil)
    return {
      lines,
      urgentItems,
      beforeCutoff: now.getHours() < 15,
    }
  } catch {
    return null
  }
}
