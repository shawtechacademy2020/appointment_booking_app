import { useMemo, useState } from "react";
import Calendar from "./Calendar";
import BookingPanel from "./BookingPanel";
import Confirmation from "./Confirmation";
import { loadBookings, saveBookings, startOfDay, toKey } from "./lib";
import type { Booking } from "./lib";


export default function App() {
  const [now] = useState(() => new Date());
  const today = startOfDay(now);
  const [view, setView] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(loadBookings);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const booked = useMemo(
    () => new Set(bookings.map((b) => b.date)),
    [bookings],
  );


  const confirm = (data: Omit<Booking, "id">) => {
    const booking: Booking = { ...data, id: crypto.randomUUID() };
    const next = [...bookings, booking];
    setBookings(next);
    saveBookings(next);
    setConfirmed(booking);
  };
  const reset = () => {
    setConfirmed(null);
    setSelected(null);
  };


  return (
    <main className="min-h-screen bg-linear-to-br from-sky-200 via-blue-100 to-indigo-100 px-4 py-12 font-sans text-slate-900">
      <header className="mx-auto mb-8 max-w-xl text-center">
        <h1 className="inline-block text-4xl font-extrabold tracking-tight sm:text-5xl">
          Book an appointment
          <span className="mx-auto mt-2 block h-1 w-2/5 rounded-full bg-black" />
        </h1>
        <p className="mt-3 text-slate-600">
          Pick a day, choose an open time, and we'll email your confirmation.
        </p>
      </header>


      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-8">
        {confirmed ? (
          <Confirmation booking={confirmed} onReset={reset} />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <Calendar
              view={view}
              onMonth={(d) =>
                setView(new Date(view.getFullYear(), view.getMonth() + d, 1))
              }
              today={today}
              selected={selected}
              booked={booked}
              onSelect={setSelected}
            />
            {selected ? (
              <BookingPanel
                key={toKey(selected)}
                date={selected}
                bookings={bookings}
                now={now}
                onConfirm={confirm}
              />
            ) : (
              <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Select a date to see open times.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


