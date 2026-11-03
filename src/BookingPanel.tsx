import { useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Mail, MessageSquare, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SLOTS, formatLong, isUnavailable, toKey } from './lib'
import type { Booking, Period } from './lib'

interface Props {
  date: Date
  bookings: Booking[]
  now: Date
  onConfirm: (data: Omit<Booking, 'id'>) => void
}

const input =
  'w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-blue-500'

function Field(props: { id: string; label: string; icon: LucideIcon; error?: string; children: ReactNode }) {
  const { id, label, icon: Icon, error, children } = props
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Icon aria-hidden className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400" />
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default function BookingPanel({ date, bookings, now, onConfirm }: Props) {
  const [period, setPeriod] = useState<Period>('morning')
  const [time, setTime] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const key = toKey(date)

  const openCount = SLOTS[period].filter((t) => !isUnavailable(key, t, bookings, now)).length
  const set = (f: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [f]: e.target.value })
  const fieldProps = (f: 'name' | 'email') => ({
    id: f,
    value: form[f],
    onChange: set(f),
    'aria-invalid': !!errors[f],
    'aria-describedby': errors[f] ? `${f}-error` : undefined,
    className: `${input} ${errors[f] ? 'border-red-400' : 'border-slate-300'}`,
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!time) next.time = 'Choose a time.'
    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter an email like name@example.com.'
    setErrors(next)
    if (time && Object.keys(next).length === 0) {
      onConfirm({ date: key, time, name: form.name.trim(), email: form.email.trim(), notes: form.notes.trim() })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{formatLong(date)}</h2>
        <p className="text-sm text-slate-500">30-minute appointment</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <div role="group" aria-label="Part of day" className="inline-flex overflow-hidden rounded-lg border border-black">
            {(['morning', 'afternoon'] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-semibold capitalize focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 ${
                  period === p ? 'bg-black text-white' : 'bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">{openCount} open</p>
        </div>

        <div role="group" aria-label="Available times" className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {SLOTS[period].map((t) => {
            const off = isUnavailable(key, t, bookings, now)
            const on = t === time
            return (
              <button
                key={t}
                type="button"
                disabled={off}
                aria-pressed={on}
                onClick={() => setTime(t)}
                className={`rounded-lg border py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  on
                    ? 'border-black bg-black text-white'
                    : off
                      ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                      : 'border-slate-300 text-slate-800 hover:border-black'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
        {errors.time && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {errors.time}
          </p>
        )}
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-5">
        <Field id="name" label="Full name" icon={User} error={errors.name}>
          <input {...fieldProps('name')} autoComplete="name" placeholder="Your name" />
        </Field>
        <Field id="email" label="Email address" icon={Mail} error={errors.email}>
          <input {...fieldProps('email')} type="email" autoComplete="email" placeholder="email@example.com" />
        </Field>
        <Field id="notes" label="Notes (optional)" icon={MessageSquare}>
          <textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Anything we should know?"
            className={`${input} resize-none border-slate-300`}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        Confirm booking
      </button>
    </form>
  )
}

