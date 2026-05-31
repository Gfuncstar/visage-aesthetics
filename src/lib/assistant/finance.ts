// Profit and accountant-pack maths. Pure functions over rows fetched by the
// API routes. Only CONFIRMED orders count toward spend; orders sitting in the
// review queue (status 'pending') never affect totals. Revenue is the sum of
// COMPLETED appointments.
//
// VAT is recorded as entered and reported as-is. We make no assertion about how
// aesthetic treatments are treated for VAT — that judgement is the accountant's.

import type { Appointment, Order } from './types'
import { gbp, money2, ukDate, monthLabel } from './format'

export type RevenueGroup = { service: string; count: number; total: number }

export function revenueByTreatment(appointments: Appointment[]): RevenueGroup[] {
  const map = new Map<string, RevenueGroup>()
  for (const a of appointments) {
    if (a.status !== 'completed') continue
    const key = a.service_name || 'Unspecified'
    const g = map.get(key) ?? { service: key, count: 0, total: 0 }
    g.count += 1
    g.total += Number(a.price) || 0
    map.set(key, g)
  }
  return Array.from(map.values()).sort((x, y) => y.total - x.total)
}

export type MonthSummary = {
  revenue: number
  appointmentsCount: number
  stockCost: number
  otherCost: number
  totalCost: number
  vatOnPurchases: number
  netProfit: number
  marginPct: number
  unpaid: Order[]
  unpaidTotal: number
}

export function monthSummary(appointments: Appointment[], orders: Order[]): MonthSummary {
  const completed = appointments.filter((a) => a.status === 'completed')
  const revenue = completed.reduce((s, a) => s + (Number(a.price) || 0), 0)

  const confirmed = orders.filter((o) => o.status === 'confirmed')
  let stockCost = 0
  let otherCost = 0
  let vatOnPurchases = 0
  for (const o of confirmed) {
    const total = Number(o.total) || 0
    vatOnPurchases += Number(o.vat) || 0
    if (o.category === 'stock') stockCost += total
    else otherCost += total
  }
  const totalCost = stockCost + otherCost
  const netProfit = revenue - totalCost
  const marginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0

  const unpaid = confirmed.filter((o) => !o.paid)
  const unpaidTotal = unpaid.reduce((s, o) => s + (Number(o.total) || 0), 0)

  return {
    revenue,
    appointmentsCount: completed.length,
    stockCost,
    otherCost,
    totalCost,
    vatOnPurchases,
    netProfit,
    marginPct,
    unpaid,
    unpaidTotal,
  }
}

/** Copyable plain-text accountant summary for a month. */
export function buildAccountantText(
  monthKey: string,
  s: MonthSummary,
  revenue: RevenueGroup[],
): string {
  const L: string[] = []
  L.push(`VISAGE AESTHETICS — ${monthLabel(monthKey).toUpperCase()}`)
  L.push('Accountant summary. All amounts GBP. VAT recorded as entered.')
  L.push('')
  L.push('INCOME')
  L.push(`  Completed appointments: ${s.appointmentsCount}`)
  for (const g of revenue) {
    L.push(`  ${g.service} (${g.count}): ${gbp(g.total)}`)
  }
  L.push(`  Total income: ${gbp(s.revenue)}`)
  L.push('')
  L.push('EXPENSES (confirmed only)')
  L.push(`  Stock / products: ${gbp(s.stockCost)}`)
  L.push(`  Other costs: ${gbp(s.otherCost)}`)
  L.push(`  Total expenses: ${gbp(s.totalCost)}`)
  L.push(`  VAT on purchases (as entered): ${gbp(s.vatOnPurchases)}`)
  L.push('')
  L.push('PROFIT')
  L.push(`  Net profit: ${gbp(s.netProfit)}`)
  L.push(`  Margin: ${s.marginPct.toFixed(1)}%`)
  L.push('')
  L.push('UNPAID SUPPLIER INVOICES')
  if (s.unpaid.length === 0) {
    L.push('  None outstanding.')
  } else {
    for (const o of s.unpaid) {
      L.push(`  ${ukDate(o.date)}  ${o.supplier_name}  ${gbp(Number(o.total))}`)
    }
    L.push(`  Total outstanding: ${gbp(s.unpaidTotal)}`)
  }
  return L.join('\n')
}

function csvCell(value: string | number): string {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** A downloadable CSV of every income and expense line for the period. */
export function buildAccountantCsv(appointments: Appointment[], orders: Order[]): string {
  const rows: (string | number)[][] = []
  rows.push(['Type', 'Date', 'Description', 'Category', 'Net', 'VAT', 'Total', 'Paid'])

  for (const a of appointments) {
    if (a.status !== 'completed') continue
    rows.push([
      'Income',
      ukDate(a.date),
      `${a.service_name}${a.client_name ? ` — ${a.client_name}` : ''}`,
      'Treatment revenue',
      money2(Number(a.price)),
      '',
      money2(Number(a.price)),
      'Paid',
    ])
  }

  for (const o of orders) {
    if (o.status !== 'confirmed') continue
    rows.push([
      'Expense',
      ukDate(o.date),
      `${o.supplier_name}${o.order_number ? ` (${o.order_number})` : ''}`,
      o.category,
      money2(Number(o.net)),
      money2(Number(o.vat)),
      money2(Number(o.total)),
      o.paid ? 'Paid' : 'Unpaid',
    ])
  }

  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
}
