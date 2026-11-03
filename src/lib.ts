export interface Booking {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  name: string
  email: string
  notes: string
}
export type Period = 'morning' | 'afternoon'

const pad = (n: number) => String(n).padStart(2, '0')
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const formatLong = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export function monthCells(view: Date): (Date | null)[] {
  const y = view.getFullYear()
  const m = view.getMonth()
  const leading = Array.from({ length: new Date(y, m, 1).getDay() }, () => null)
  const days = Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => new Date(y, m, i + 1))
  return [...leading, ...days]
}

export const SLOTS: Record<Period, string[]> = {
  morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  afternoon: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
}

const hash = (s: string) => {
  let h = 7
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

/** A slot is unavailable if it's in the past, already booked here, or taken by someone else. */
export function isUnavailable(dateKey: string, time: string, bookings: Booking[], now: Date) {
  if (bookings.some((b) => b.date === dateKey && b.time === time)) return true
  if (hash(dateKey + time) % 4 === 0) return true // stand-in for slots taken by other clients; replace with an API call
  const [h, m] = time.split(':').map(Number)
  const slot = fromKey(dateKey)
  slot.setHours(h, m)
  return slot <= now
}

const STORE = 'appointments'
export const loadBookings = (): Booking[] => {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '[]')
  } catch {
    return []
  }
}
export const saveBookings = (b: Booking[]) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(b))
  } catch {
    /* storage unavailable */
  }
}

export function downloadIcs(b: Booking) {
  const start = fromKey(b.date)
  const [h, m] = b.time.split(':').map(Number)
  start.setHours(h, m)
  const end = new Date(start.getTime() + 30 * 60000)
  const local = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Appointment Booking//EN',
    'BEGIN:VEVENT',
    `UID:${b.id}@appointment-booking`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    'SUMMARY:Appointment',
    `DESCRIPTION:${b.notes.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'appointment.ics'
  a.click()
  URL.revokeObjectURL(url)
}
