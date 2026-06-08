// Tolerant CSV parser for an Ovatu appointments export (the fallback when the
// live Ovatu API is not wired). Maps common header names to our appointment
// shape. Designed to be forgiving: unknown columns are ignored, and rows with
// no usable date are skipped.

export type ParsedAppointment = {
  date: string // ISO YYYY-MM-DD
  client_name: string
  service_name: string
  price: number
  status: 'completed' | 'cancelled' | 'no_show' | 'booked'
  // Captured when present, so an upcoming appointment can be rebuilt as a real,
  // changeable booking (not just a reporting row). Null when the export omits them.
  startMinutes: number | null // minutes from midnight, London wall time
  email: string | null
  phone: string | null
}

export type ParseResult = {
  rows: ParsedAppointment[]
  skipped: number
  headers: string[]
}

/** Parse one CSV row, honouring double-quote escaping. */
function parseLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

function splitRows(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0)
}

const HEADERS = {
  date: ['date', 'appointment date', 'appt date', 'start', 'start date', 'date/time', 'datetime', 'when'],
  time: ['time', 'start time', 'appt time', 'appointment time', 'starts', 'from'],
  client: ['client', 'client name', 'customer', 'customer name', 'name', 'patient'],
  service: ['service', 'service name', 'treatment', 'appointment type', 'type'],
  price: ['price', 'total', 'amount', 'cost', 'paid', 'value', 'revenue'],
  status: ['status', 'state', 'appointment status'],
  email: ['email', 'email address', 'e-mail', 'client email', 'customer email'],
  phone: ['phone', 'mobile', 'telephone', 'phone number', 'mobile number', 'contact number', 'cell'],
}

/** Parse a clock time like "14:30", "2:30 pm", "2pm" to minutes from midnight. */
function toMinutes(raw: string | undefined): number | null {
  if (!raw) return null
  const s = raw.trim().toLowerCase()
  const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
  if (!m) return null
  let h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  const ap = m[3]
  if (h > 23 || min > 59) return null
  if (ap === 'pm' && h < 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  return h * 60 + min
}

function findCol(headers: string[], names: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().trim())
  for (const n of names) {
    const i = lower.indexOf(n)
    if (i !== -1) return i
  }
  // loose contains match
  for (let i = 0; i < lower.length; i++) {
    if (names.some((n) => lower[i].includes(n))) return i
  }
  return -1
}

function toIsoDate(raw: string): string | null {
  if (!raw) return null
  const s = raw.trim().split(/[ T]/)[0] // drop any time component
  // ISO already
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // DD/MM/YYYY or DD-MM-YYYY (UK)
  let m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
  if (m) {
    let [, d, mo, y] = m
    if (y.length === 2) y = `20${y}`
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  // "31 May 2026" style
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return null
}

function toPrice(raw: string): number {
  if (!raw) return 0
  const n = parseFloat(raw.replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function toStatus(raw: string): ParsedAppointment['status'] {
  const s = (raw || '').toLowerCase()
  if (/cancel/.test(s)) return 'cancelled'
  if (/no.?show/.test(s)) return 'no_show'
  if (/book|confirm|schedul|upcoming|pending/.test(s)) return 'booked'
  if (/complet|attend|done|finish|paid/.test(s)) return 'completed'
  // Default: treat as completed so revenue counts (most exports are of past appts).
  return 'completed'
}

export function parseOvatuCsv(text: string): ParseResult {
  const lines = splitRows(text)
  if (lines.length < 2) return { rows: [], skipped: 0, headers: [] }

  const headers = parseLine(lines[0])
  const cDate = findCol(headers, HEADERS.date)
  const cTime = findCol(headers, HEADERS.time)
  const cClient = findCol(headers, HEADERS.client)
  const cService = findCol(headers, HEADERS.service)
  const cPrice = findCol(headers, HEADERS.price)
  const cStatus = findCol(headers, HEADERS.status)
  const cEmail = findCol(headers, HEADERS.email)
  const cPhone = findCol(headers, HEADERS.phone)

  const rows: ParsedAppointment[] = []
  let skipped = 0

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    const dateCell = cDate >= 0 ? cols[cDate] ?? '' : ''
    const date = toIsoDate(dateCell)
    if (!date) {
      skipped++
      continue
    }
    // Time may live in its own column, or after the date in a combined cell.
    const timeFromDate = dateCell.includes(' ') || dateCell.includes('T') ? dateCell.split(/[ T]/).slice(1).join(' ') : ''
    const startMinutes = toMinutes(cTime >= 0 ? cols[cTime] : undefined) ?? toMinutes(timeFromDate)
    const email = cEmail >= 0 ? (cols[cEmail] ?? '').trim() || null : null
    const phone = cPhone >= 0 ? (cols[cPhone] ?? '').trim() || null : null
    rows.push({
      date,
      client_name: cClient >= 0 ? cols[cClient] ?? '' : '',
      service_name: cService >= 0 ? cols[cService] ?? '' : '',
      price: cPrice >= 0 ? toPrice(cols[cPrice]) : 0,
      status: cStatus >= 0 ? toStatus(cols[cStatus]) : 'completed',
      startMinutes,
      email,
      phone,
    })
  }

  return { rows, skipped, headers }
}
