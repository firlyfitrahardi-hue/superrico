import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Check, Clock, Copy, Undo2, Users } from 'lucide-react'
import { Instagram, WhatsApp } from './icons'
import PageSection, { SPRING, SectionHeading, reveal, type Activate } from './PageSection'
import { brand } from '../data/sections'
import type { ReservationRequest } from '../types'

interface Props {
  onActivate: Activate
}

const STORAGE_KEY = 'superrico:lastReservation'
const UNDO_WINDOW_MS = 8000

const todayISO = () => {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

const buildSlots = (first: string, last: string, stepMin = 30) => {
  const [fh, fm] = first.split(':').map(Number)
  const [lh, lm] = last.split(':').map(Number)
  const slots: string[] = []
  for (let t = fh * 60 + fm; t <= lh * 60 + lm; t += stepMin) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
  }
  return slots
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const composeMessage = (r: ReservationRequest) =>
  [
    `Hi Super Rico! I'd like to reserve a table.`,
    `Name: ${r.name}`,
    `Date: ${formatDate(r.date)}`,
    `Time: ${r.time}`,
    `Guests: ${r.guests}`,
    r.notes ? `Notes: ${r.notes}` : null,
    `Contact: ${r.phone}`,
  ]
    .filter(Boolean)
    .join('\n')

const readSaved = (): ReservationRequest | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ReservationRequest) : null
  } catch {
    return null
  }
}

const save = (r: ReservationRequest | null) => {
  try {
    if (r) localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable: the on-screen state still works */
  }
}

const emptyForm = (firstSlot: string): ReservationRequest => ({
  name: '',
  phone: '',
  date: todayISO(),
  time: firstSlot,
  guests: 2,
  notes: '',
})

type Field = keyof ReservationRequest
type Errors = Partial<Record<Field, string>>

// Symmetric paths: the form leaves and returns upward, the confirmation arrives from and
// returns downward. Going back retraces the way you came.
const formMotion = { initial: { opacity: 0, y: -16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } }
const doneMotion = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 16 } }

export default function ReservationSection({ onActivate }: Props) {
  const slots = useMemo(() => buildSlots(brand.firstSeating, brand.lastSeating), [])
  const [form, setForm] = useState<ReservationRequest>(() => emptyForm(slots[0] ?? ''))
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState<ReservationRequest | null>(() => readSaved())
  const [cleared, setCleared] = useState<ReservationRequest | null>(null)
  const [copied, setCopied] = useState(false)
  const undoTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(undoTimer.current), [])

  const validateField = (key: Field, r: ReservationRequest): string | undefined => {
    switch (key) {
      case 'name':
        return r.name.trim().length < 2 ? 'Please enter your name.' : undefined
      case 'phone':
        return /^\+?[\d\s-]{8,}$/.test(r.phone.trim()) ? undefined : 'Enter a valid WhatsApp number, at least 8 digits.'
      case 'date':
        return !r.date || r.date < todayISO() ? 'Pick today or a future date.' : undefined
      case 'time':
        return slots.includes(r.time) ? undefined : 'Pick a seating time.'
      case 'guests':
        return Number.isInteger(r.guests) && r.guests >= 1 && r.guests <= brand.maxGuests
          ? undefined
          : `Between 1 and ${brand.maxGuests} guests. For bigger groups, DM us.`
      default:
        return undefined
    }
  }

  const validateAll = (r: ReservationRequest): Errors => {
    const e: Errors = {}
    for (const key of ['name', 'phone', 'date', 'time', 'guests'] as Field[]) {
      const message = validateField(key, r)
      if (message) e[key] = message
    }
    return e
  }

  // While a field is showing an error, re-check it on every change so the message clears
  // the moment the value becomes valid.
  const update = <K extends Field>(key: K, value: ReservationRequest[K]) => {
    const next = { ...form, [key]: value }
    setForm(next)
    if (errors[key]) setErrors((e) => ({ ...e, [key]: validateField(key, next) }))
  }

  // Validate inline, as each field is left, rather than only on submit
  const blur = (key: Field) => setErrors((e) => ({ ...e, [key]: validateField(key, form) }))

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validateAll(form)
    setErrors(e)
    const firstInvalid = Object.keys(e)[0]
    if (firstInvalid) {
      document.getElementById(`r-${firstInvalid}`)?.focus()
      return
    }

    const request = { ...form, name: form.name.trim(), phone: form.phone.trim(), notes: form.notes.trim() }
    save(request)
    if (brand.whatsapp) {
      window.open(`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(composeMessage(request))}`, '_blank', 'noopener')
    }
    window.clearTimeout(undoTimer.current)
    setCleared(null)
    setSubmitted(request)
  }

  // Forgiveness: clearing a request can be undone for a few seconds
  const reset = () => {
    if (!submitted) return
    setCleared(submitted)
    setSubmitted(null)
    setCopied(false)
    setErrors({})
    setForm(emptyForm(slots[0] ?? ''))
    save(null)
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setCleared(null), UNDO_WINDOW_MS)
  }

  const undo = () => {
    if (!cleared) return
    window.clearTimeout(undoTimer.current)
    save(cleared)
    setSubmitted(cleared)
    setCleared(null)
  }

  const copyMessage = async () => {
    if (!submitted) return
    try {
      await navigator.clipboard.writeText(composeMessage(submitted))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the message is visible on screen */
    }
  }

  const field =
    'w-full rounded-2xl border bg-[#FFF8E7]/5 px-4 py-3.5 text-base text-[#FFF8E7] placeholder:text-[#FFF8E7]/55 outline-none transition-colors focus:border-[#F7C948] focus:bg-[#FFF8E7]/10'
  const ok = 'border-[#FFF8E7]/20'
  const bad = 'border-[#FF8A80]'
  const label = 'block text-xs font-semibold uppercase tracking-[0.2em] opacity-85 mb-2'
  const stepper =
    'press h-12 w-12 shrink-0 rounded-2xl border border-[#FFF8E7]/20 text-xl hover:bg-[#FFF8E7]/10 disabled:opacity-40 disabled:pointer-events-none'

  const errorProps = (key: Field) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `r-${key}-error` : undefined,
  })

  const ErrorText = ({ name }: { name: Field }) =>
    errors[name] ? (
      <p id={`r-${name}-error`} role="alert" className="mt-1.5 text-sm text-[#FFB4AB]">
        {errors[name]}
      </p>
    ) : null

  const dt = 'text-xs uppercase tracking-[0.2em] opacity-75'

  return (
    <PageSection id="reserve" theme="night" onActivate={onActivate} className="py-24 md:py-32 overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#E63946]/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#F7C948]/20 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 md:gap-20 items-start">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Reservations"
            title="Book A Table."
            intro="Tell us when you are coming and how many of you there are. We confirm every request on WhatsApp."
          />
          <motion.ul className="space-y-4 text-sm md:text-base opacity-90" {...reveal}>
            <li className="flex items-center gap-3"><Clock size={18} className="shrink-0 text-[#F7C948]" /> {brand.hoursNote}, {brand.hours}. Last seating {brand.lastSeating.replace(':', '.')}.</li>
            <li className="flex items-center gap-3"><Users size={18} className="shrink-0 text-[#F7C948]" /> Up to {brand.maxGuests} guests online. Larger groups, message us on Instagram.</li>
            <li className="flex items-center gap-3"><CalendarDays size={18} className="shrink-0 text-[#F7C948]" /> Walk-ins always welcome, reservations guarantee your seats.</li>
          </motion.ul>
        </div>

        <motion.div
          className="glass rounded-[2rem] border border-[#FFF8E7]/10 bg-[#FFF8E7]/[0.05] p-6 md:p-10 backdrop-blur-sm"
          {...reveal}
        >
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div key="done" {...doneMotion} transition={SPRING} role="status" aria-live="polite">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2F8F46] text-[#FFF8E7]">
                  <Check size={22} strokeWidth={2.5} />
                </div>
                <h3 className="mt-5 font-display text-3xl tracking-wide">
                  {brand.whatsapp ? 'Request sent to WhatsApp.' : 'Your request is ready.'}
                </h3>
                <p className="mt-2 text-sm opacity-85">
                  {brand.whatsapp
                    ? 'A WhatsApp chat opened with your details. Send it and we will confirm shortly.'
                    : 'Copy the message below and send it to us on Instagram, and we will confirm your table.'}
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-[#FFF8E7]/5 p-5 text-sm">
                  <div><dt className={dt}>Name</dt><dd className="mt-1">{submitted.name}</dd></div>
                  <div><dt className={dt}>Guests</dt><dd className="mt-1">{submitted.guests}</dd></div>
                  <div><dt className={dt}>Date</dt><dd className="mt-1">{formatDate(submitted.date)}</dd></div>
                  <div><dt className={dt}>Time</dt><dd className="mt-1">{submitted.time}</dd></div>
                  {submitted.notes ? (
                    <div className="col-span-2"><dt className={dt}>Notes</dt><dd className="mt-1">{submitted.notes}</dd></div>
                  ) : null}
                </dl>

                <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-black/30 p-4 text-sm leading-relaxed opacity-90">{composeMessage(submitted)}</pre>

                <div className="mt-6 flex flex-wrap gap-3">
                  {brand.whatsapp ? (
                    <a
                      href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(composeMessage(submitted))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="press press-lift inline-flex items-center gap-2 rounded-full bg-[#2F8F46] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF8E7]"
                    >
                      <WhatsApp size={16} /> Open WhatsApp again
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={copyMessage}
                    className="press press-lift inline-flex items-center gap-2 rounded-full bg-[#F7C948] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2A1208]"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy message'}
                  </button>
                  <a
                    href={brand.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="press inline-flex items-center gap-2 rounded-full border border-[#FFF8E7]/25 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#FFF8E7]/10"
                  >
                    <Instagram size={16} /> DM on Instagram
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="press rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] opacity-80 hover:opacity-100 hover:bg-[#FFF8E7]/10"
                  >
                    New request
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} noValidate {...formMotion} transition={SPRING} className="grid sm:grid-cols-2 gap-5">
                <AnimatePresence initial={false}>
                  {cleared ? (
                    <motion.div
                      key="undo"
                      role="status"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={SPRING}
                      className="sm:col-span-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#FFF8E7]/10 px-4 py-3 text-sm">
                        <span>Request for {cleared.name} cleared.</span>
                        <button
                          type="button"
                          onClick={undo}
                          className="press inline-flex items-center gap-2 rounded-full bg-[#FFF8E7] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2A1208]"
                        >
                          <Undo2 size={14} /> Undo
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="sm:col-span-2">
                  <label htmlFor="r-name" className={label}>Name</label>
                  <input id="r-name" className={`${field} ${errors.name ? bad : ok}`} placeholder="Your name" value={form.name} onChange={(e) => update('name', e.target.value)} onBlur={() => blur('name')} autoComplete="name" required {...errorProps('name')} />
                  <ErrorText name="name" />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="r-phone" className={label}>WhatsApp number</label>
                  <input id="r-phone" type="tel" className={`${field} ${errors.phone ? bad : ok}`} placeholder="08xx xxxx xxxx" value={form.phone} onChange={(e) => update('phone', e.target.value)} onBlur={() => blur('phone')} inputMode="tel" autoComplete="tel" required {...errorProps('phone')} />
                  <ErrorText name="phone" />
                </div>

                <div>
                  <label htmlFor="r-date" className={label}>Date</label>
                  <input id="r-date" type="date" min={todayISO()} className={`${field} ${errors.date ? bad : ok} [color-scheme:dark]`} value={form.date} onChange={(e) => update('date', e.target.value)} onBlur={() => blur('date')} required {...errorProps('date')} />
                  <ErrorText name="date" />
                </div>

                <div>
                  <label htmlFor="r-time" className={label}>Time</label>
                  <select id="r-time" className={`${field} ${errors.time ? bad : ok} [color-scheme:dark]`} value={form.time} onChange={(e) => update('time', e.target.value)} onBlur={() => blur('time')} {...errorProps('time')}>
                    {slots.map((s) => (
                      <option key={s} value={s} className="text-black">{s}</option>
                    ))}
                  </select>
                  <ErrorText name="time" />
                </div>

                <div>
                  <label htmlFor="r-guests" className={label}>Guests</label>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Fewer guests" disabled={form.guests <= 1} onClick={() => update('guests', Math.max(1, form.guests - 1))} className={stepper}>−</button>
                    <input id="r-guests" type="number" min={1} max={brand.maxGuests} className={`${field} ${errors.guests ? bad : ok} text-center`} value={form.guests} onChange={(e) => update('guests', Number(e.target.value))} onBlur={() => blur('guests')} {...errorProps('guests')} />
                    <button type="button" aria-label="More guests" disabled={form.guests >= brand.maxGuests} onClick={() => update('guests', Math.min(brand.maxGuests, form.guests + 1))} className={stepper}>+</button>
                  </div>
                  <ErrorText name="guests" />
                </div>

                <div>
                  <label htmlFor="r-notes" className={label}>Notes (optional)</label>
                  <input id="r-notes" className={`${field} ${ok}`} placeholder="Birthday, high chair, window seat…" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
                </div>

                <div className="sm:col-span-2 mt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="submit"
                    className="press press-lift inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-7 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#FFF8E7]"
                  >
                    {brand.whatsapp ? <WhatsApp size={16} /> : null}
                    Request reservation
                  </button>
                  <p className="text-sm opacity-80">
                    {brand.whatsapp ? 'Opens WhatsApp with your details pre-filled.' : 'We reply on Instagram or WhatsApp within the day.'}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageSection>
  )
}
