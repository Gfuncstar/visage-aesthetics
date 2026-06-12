// "What was this treatment worth?" — the headline website price for a booking's
// treatment, used for the per-day takings card and the end-of-day summary email.
//
// These are the public "from" prices on the treatments pages (src/lib/treatments.ts),
// matched against the booking's service name — an honest estimate of the day's
// clinical value, NOT what Stripe processed. Consultations, reviews and HIFU
// (price on consultation) carry no assumed value.

const PRICES: { test: RegExp; price: number }[] = [
  // More specific names first so they aren't swept up by the broader buckets.
  { test: /haytox|hay.?fever|rhinitis/, price: 150 },
  { test: /harmonyca|harmony ca/, price: 500 },
  { test: /profhilo|structura/, price: 180 },
  { test: /polynucleotide|plinest|nucleofill|\bpn\b/, price: 150 },
  { test: /skin.?booster|booster|bio.?remodel/, price: 100 },
  { test: /micro.?needl|microneedl|skin.?needl|derma.?pen|dermaroll/, price: 80 },
  { test: /aqualyx|fat.?dissolv|deoxychol/, price: 100 },
  { test: /cryopen|cryo/, price: 50 },
  { test: /hyperhidrosis|sweat|excessive/, price: 200 },
  { test: /\bnad\b/, price: 40 },
  { test: /\bb12\b|b-12|vitamin.?b/, price: 30 },
  { test: /map.?my.?mole|mole/, price: 90 },
  // Botox / anti-wrinkle (incl. masseter, migraine use).
  { test: /botox|anti.?wrinkle|toxin|wrinkle|masseter|jaw.?slim|migraine/, price: 120 },
  // Dermal filler — general HA filler and its common sites.
  { test: /filler|lip|cheek|tear.?trough|jawline|\bchin\b|nasolabial|juvederm|restylane/, price: 110 },
  // No assumed value — consultations, reviews, top-up checks, HIFU.
  { test: /consult|review|follow.?up|complimentary|\bhifu\b|focused.?ultrasound/, price: 0 },
]

/** Best-effort website price for a treatment, by its service name. 0 when unknown. */
export function treatmentPrice(serviceName: string | null | undefined): number {
  const s = (serviceName ?? '').toLowerCase().trim()
  if (!s) return 0
  for (const { test, price } of PRICES) {
    if (test.test(s)) return price
  }
  return 0
}

type Priced = { service_name: string; status: string }

/** Sum the website value of a day's attended bookings (excludes cancelled / no-shows). */
export function dayTakings<T extends Priced>(bookings: T[]): { total: number; attended: number; lines: { service: string; count: number; total: number }[] } {
  const attended = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'no_show')
  const byService = new Map<string, { count: number; total: number }>()
  let total = 0
  for (const b of attended) {
    const price = treatmentPrice(b.service_name)
    total += price
    const cur = byService.get(b.service_name) ?? { count: 0, total: 0 }
    cur.count += 1
    cur.total += price
    byService.set(b.service_name, cur)
  }
  const lines = Array.from(byService.entries())
    .map(([service, v]) => ({ service, count: v.count, total: v.total }))
    .sort((a, b) => b.total - a.total)
  return { total, attended: attended.length, lines }
}
