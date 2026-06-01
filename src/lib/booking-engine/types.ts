// Shared types for the native booking engine.

export type Service = {
  id: string
  slug: string
  name: string
  category: string | null
  duration_min: number
  buffer_min: number
  price_from: number
  deposit: number
  description: string | null
  online_bookable: boolean
  active: boolean
  display_order: number
}

export type BusinessHours = {
  weekday: number // 0=Sun..6=Sat
  is_open: boolean
  open_min: number
  close_min: number
}

export type TimeOff = {
  id: string
  starts_at: string
  ends_at: string
  reason: string | null
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export type Booking = {
  id: string
  service_id: string | null
  service_name: string
  service_slug: string | null
  client_name: string
  client_email: string | null
  client_phone: string | null
  starts_at: string
  ends_at: string
  status: BookingStatus
  notes: string | null
  source: 'online' | 'staff'
  manage_token: string
  created_at: string
  updated_at: string
}

export type Slot = { startMinutes: number; startsAtIso: string; endsAtIso: string; label: string }
