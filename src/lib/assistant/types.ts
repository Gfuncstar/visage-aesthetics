// Shared types mirroring the Assistant database tables.

export type OrderCategory =
  | 'stock'
  | 'equipment'
  | 'insurance'
  | 'marketing'
  | 'premises'
  | 'training'
  | 'other'

export const ORDER_CATEGORIES: { value: OrderCategory; label: string }[] = [
  { value: 'stock', label: 'Stock / products' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'premises', label: 'Premises' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
]

export type Client = {
  id: string
  ovatu_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  source: string
  created_at: string
}

export type Appointment = {
  id: string
  client_id: string | null
  client_name: string
  date: string
  service_name: string
  price: number
  status: 'completed' | 'cancelled' | 'no_show' | 'booked'
  import_batch: string | null
  created_at: string
}

export type AreaDose = { area: string; dose: number; unit: string }

export type TreatmentRecord = {
  id: string
  client_id: string | null
  appointment_id: string | null
  client_name: string
  date: string
  treatment_type: string
  product: string | null
  batch_number: string | null
  expiry: string | null
  areas: AreaDose[]
  total_dose: number | null
  unit: string | null
  technique: string | null
  consent: boolean
  review_date: string | null
  notes: string | null
  clinical_note: string | null
  created_at: string
}

export type Order = {
  id: string
  supplier_id: string | null
  supplier_name: string
  date: string
  source_email_id: string | null
  order_number: string | null
  category: OrderCategory
  net: number
  vat: number
  total: number
  currency: string
  paid: boolean
  status: 'pending' | 'confirmed'
  parse_confidence: number | null
  raw_source: string | null
  created_at: string
}

export type Supplier = { id: string; name: string; created_at: string }
