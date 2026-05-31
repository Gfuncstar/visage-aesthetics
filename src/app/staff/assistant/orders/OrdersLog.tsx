'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Inbox, LogOut, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { ORDER_CATEGORIES, type Order, type OrderCategory } from '@/lib/assistant/types'
import { gbp, ukDate, currentMonthKey, monthLabel, recentMonthKeys } from '@/lib/assistant/format'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-3 py-2.5 text-sm text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold'

export default function OrdersLog() {
  const [month, setMonth] = useState(currentMonthKey())
  const [orders, setOrders] = useState<Order[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const [pollMsg, setPollMsg] = useState<string | null>(null)
  const months = recentMonthKeys(12)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/staff/assistant/orders?month=${month}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not load orders.')
        return
      }
      setConfigured(data.configured !== false)
      setOrders(data.orders ?? [])
    } catch {
      setError('Network error while loading orders.')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    void load()
  }, [load])

  async function checkInbox() {
    setPolling(true)
    setPollMsg(null)
    try {
      const res = await fetch('/api/staff/assistant/orders/poll', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPollMsg(data.error || 'Could not check the inbox.')
        return
      }
      setPollMsg(`Scanned ${data.scanned}. ${data.created} new, ${data.duplicates} already logged.`)
      void load()
    } catch {
      setPollMsg('Network error while checking the inbox.')
    } finally {
      setPolling(false)
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...body } as Order : o)))
    const res = await fetch(`/api/staff/assistant/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) void load()
  }

  async function del(id: string) {
    if (!window.confirm('Delete this line?')) return
    setOrders((prev) => prev.filter((o) => o.id !== id))
    await fetch(`/api/staff/assistant/orders/${id}`, { method: 'DELETE' })
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const pending = orders.filter((o) => o.status === 'pending')
  const confirmed = orders.filter((o) => o.status === 'confirmed')
  const confirmedTotal = confirmed.reduce((s, o) => s + Number(o.total || 0), 0)
  const unpaidTotal = confirmed.filter((o) => !o.paid).reduce((s, o) => s + Number(o.total || 0), 0)

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-16 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <Link href="/staff/assistant" className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4">
              <ArrowLeft size={14} strokeWidth={1.75} />
              Assistant
            </Link>
            <div className="eyebrow text-gold mb-2">Assistant &nbsp;·&nbsp; Orders &amp; expenses</div>
            <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">The order book.</h1>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2" aria-label="Sign out">
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {!configured && (
          <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 mb-6 leading-relaxed">
            The clinic database is not connected. Add <code>SUPABASE_URL</code> and{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in Vercel to start logging orders.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={`${inputClass} w-auto`}>
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <button onClick={checkInbox} disabled={polling || !configured} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 42 }}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={14} strokeWidth={1.75} className={polling ? 'animate-spin' : ''} />
              {polling ? 'Checking inbox…' : 'Check inbox now'}
            </span>
          </button>
          {pollMsg && <span className="text-xs text-ink-soft">{pollMsg}</span>}
        </div>

        {error && <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 mb-6">{error}</div>}

        {/* Review queue */}
        {pending.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Inbox size={16} className="text-gold-deep" />
              <span className="text-eyebrow text-gold-deep">Review queue &nbsp;·&nbsp; {pending.length} to confirm</span>
            </div>
            <p className="text-sm text-ink-soft mb-4 leading-relaxed">
              These were read from the inbox and are not counted yet. Check each one, edit if needed, then confirm.
            </p>
            <div className="space-y-3">
              {pending.map((o) => (
                <OrderRow key={o.id} order={o} editable onPatch={patch} onDelete={del} queue />
              ))}
            </div>
          </div>
        )}

        {/* Manual add */}
        <ManualAdd month={month} disabled={!configured} onAdded={load} />

        {/* Confirmed */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-eyebrow text-ink-soft">Logged this month</span>
            <div className="text-sm text-ink-soft">
              <span className="text-charcoal font-medium">{gbp(confirmedTotal)}</span> total
              {unpaidTotal > 0 && <span className="text-clay ml-3">{gbp(unpaidTotal)} unpaid</span>}
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-ink-soft py-8 text-center">Loading…</p>
          ) : confirmed.length === 0 ? (
            <p className="text-sm text-ink-soft py-8 text-center border border-line/40 rounded-sm bg-cream-soft">
              Nothing logged for {monthLabel(month)} yet.
            </p>
          ) : (
            <div className="space-y-2">
              {confirmed.map((o) => (
                <OrderRow key={o.id} order={o} editable onPatch={patch} onDelete={del} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function OrderRow({
  order,
  editable,
  onPatch,
  onDelete,
  queue = false,
}: {
  order: Order
  editable: boolean
  onPatch: (id: string, body: Record<string, unknown>) => void
  onDelete: (id: string) => void
  queue?: boolean
}) {
  return (
    <div className={`border rounded-sm px-4 py-3 ${queue ? 'border-gold/40 bg-gold/5' : 'border-line/40 bg-cream-soft'}`}>
      <div className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] gap-2 items-center">
        <input className={inputClass} defaultValue={order.supplier_name} onBlur={(e) => e.target.value !== order.supplier_name && onPatch(order.id, { supplier_name: e.target.value })} />
        <input type="date" className={inputClass} defaultValue={order.date} onChange={(e) => onPatch(order.id, { date: e.target.value })} />
        <select className={inputClass} defaultValue={order.category} onChange={(e) => onPatch(order.id, { category: e.target.value as OrderCategory })}>
          {ORDER_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input type="number" step="0.01" className={`${inputClass} text-right`} defaultValue={Number(order.total).toFixed(2)} onBlur={(e) => Number(e.target.value) !== Number(order.total) && onPatch(order.id, { total: Number(e.target.value) })} />
        <button onClick={() => onDelete(order.id)} className="text-stone hover:text-clay justify-self-end" aria-label="Delete"><Trash2 size={16} strokeWidth={1.75} /></button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-ink-soft">
        {order.order_number && <span>#{order.order_number}</span>}
        <span>Net {gbp(Number(order.net))} · VAT {gbp(Number(order.vat))}</span>
        {order.parse_confidence != null && <span>Parsed {(order.parse_confidence * 100).toFixed(0)}% confident</span>}
        <button onClick={() => onPatch(order.id, { paid: !order.paid })} className={`inline-flex items-center gap-1 ${order.paid ? 'text-sage' : 'text-clay'}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${order.paid ? 'bg-sage' : 'bg-clay'}`} />
          {order.paid ? 'Paid' : 'Unpaid'}
        </button>
        {queue && (
          <button onClick={() => onPatch(order.id, { status: 'confirmed' })} className="ml-auto btn btn-primary" style={{ minHeight: 34, padding: '0 16px' }}>
            <span className="inline-flex items-center gap-1.5"><Check size={13} strokeWidth={2} /> Confirm</span>
          </button>
        )}
      </div>
    </div>
  )
}

function ManualAdd({ month, disabled, onAdded }: { month: string; disabled: boolean; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [date, setDate] = useState(`${month}-01`)
  const [category, setCategory] = useState<OrderCategory>('stock')
  const [net, setNet] = useState('')
  const [vat, setVat] = useState('')
  const [total, setTotal] = useState('')
  const [paid, setPaid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function add() {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/staff/assistant/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_name: supplier,
          date,
          category,
          net: Number(net) || 0,
          vat: Number(vat) || 0,
          total: Number(total) || 0,
          paid,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(data.error || 'Could not add.')
        return
      }
      setSupplier(''); setNet(''); setVat(''); setTotal(''); setPaid(false)
      setOpen(false)
      onAdded()
    } catch {
      setErr('Network error.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} disabled={disabled} className="btn btn-secondary disabled:opacity-50">
        <span className="inline-flex items-center gap-2"><Plus size={15} strokeWidth={1.75} /> Add an order or expense</span>
      </button>
    )
  }

  return (
    <div className="border border-line/40 bg-cream-soft rounded-sm p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} placeholder="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as OrderCategory)}>
          {ORDER_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-2">
          <input className={inputClass} placeholder="Net" inputMode="decimal" value={net} onChange={(e) => setNet(e.target.value)} />
          <input className={inputClass} placeholder="VAT" inputMode="decimal" value={vat} onChange={(e) => setVat(e.target.value)} />
          <input className={inputClass} placeholder="Total" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <label className="text-sm text-ink-soft inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} /> Paid
        </label>
        <div className="flex items-center gap-2">
          {err && <span className="text-xs text-clay">{err}</span>}
          <button onClick={() => setOpen(false)} className="btn">Cancel</button>
          <button onClick={add} disabled={busy || !supplier} className="btn btn-primary disabled:opacity-50">{busy ? 'Adding…' : 'Add'}</button>
        </div>
      </div>
    </div>
  )
}
