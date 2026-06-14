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
  reminded_at: string | null
  confirmed_at: string | null
  review_requested_at: string | null
  created_at: string
  updated_at: string
  // Set true once the patient notes have been written up for this visit. The
  // Patient Notes form flags the matching booking by client name and date.
  notes_done?: boolean
  // Derived on read by the diary API — true when this is the client's first visit.
  is_new_client?: boolean
}

export type Slot = { startMinutes: number; startsAtIso: string; endsAtIso: string; label: string }
