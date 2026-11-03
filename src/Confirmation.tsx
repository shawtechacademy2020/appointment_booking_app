import { CalendarPlus, Check } from 'lucide-react'
import { downloadIcs, formatLong, fromKey } from './lib'
import type { Booking } from './lib'

export default function Confirmation({ booking, onReset }: { booking: Booking; onReset: () => void }) {
  const rows = [
    ['Date', formatLong(fromKey(booking.date))],
    ['Time', `${booking.time} (30 minutes)`],
    ['Name', booking.name],
    ['Email', booking.email],
    ...(booking.notes ? [['Notes', booking.notes]] : []),
  ]
  return (
    <div role="status" className="motion-safe:animate-pop mx-auto max-w-md py-6 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="size-7" strokeWidth={3} />
      </span>
      <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Booking confirmed</h2>
      <p className="mt-1 text-sm text-slate-600">We sent the details to {booking.email}.</p>

      <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 text-left text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-right font-medium break-words text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => downloadIcs(booking)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 py-3 text-sm font-semibold text-slate-800 hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <CalendarPlus className="size-4" /> Add to calendar
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          Book another time
        </button>
      </div>
    </div>
  )
}

