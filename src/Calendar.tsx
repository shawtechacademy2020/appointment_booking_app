import { ChevronLeft, ChevronRight } from 'lucide-react'
import { monthCells, toKey } from './lib'

interface Props {
  view: Date
  onMonth: (delta: number) => void
  today: Date
  selected: Date | null
  booked: Set<string>
  onSelect: (d: Date) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const navBtn =
  'grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-30 disabled:hover:bg-transparent'
const LEGEND = [
  ['Today', 'bg-black'],
  ['Selected', 'bg-blue-500'],
  ['Booked', 'bg-emerald-500'],
]

export default function Calendar({ view, onMonth, today, selected, booked, onSelect }: Props) {
  const todayKey = toKey(today)
  const selKey = selected ? toKey(selected) : ''
  const atCurrentMonth = view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth()

  return (
    <section aria-label="Choose a date" className="self-start rounded-2xl border border-slate-200 p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={atCurrentMonth} onClick={() => onMonth(-1)} className={navBtn}>
          <ChevronLeft className="size-4" />
        </button>
        <h2 aria-live="polite" className="text-sm font-bold text-slate-900">
          {view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button type="button" aria-label="Next month" onClick={() => onMonth(1)} className={navBtn}>
          <ChevronRight className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-7 gap-y-6 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-xs font-semibold text-slate-500">
            {d}
          </span>
        ))}
        {monthCells(view).map((d, i) => {
          if (!d) return <span key={`blank-${i}`} />
          const key = toKey(d)
          const past = key < todayKey
          const isSel = key === selKey
          const isBooked = booked.has(key)
          const tone = isSel
            ? 'bg-blue-500 text-white'
            : isBooked
              ? 'bg-emerald-500 text-white'
              : key === todayKey
                ? 'bg-black text-white'
                : past
                  ? 'text-slate-300'
                  : 'text-slate-800 hover:bg-slate-100'
          const tag = isSel ? 'Selected' : isBooked ? 'Booked' : null
          return (
            <div key={key} className="relative flex justify-center">
              {tag && (
                <span
                  className={`pointer-events-none absolute -top-3.5 -left-1 -rotate-6 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                    isSel ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {tag}
                </span>
              )}
              <button
                type="button"
                disabled={past}
                aria-pressed={isSel}
                aria-label={`${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${isBooked ? ', booked' : ''}`}
                onClick={() => onSelect(d)}
                className={`size-9 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed ${tone}`}
              >
                {d.getDate()}
              </button>
            </div>
          )
        })}
      </div>

      <ul className="mt-5 flex justify-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
        {LEGEND.map(([label, color]) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-sm ${color}`} />
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
