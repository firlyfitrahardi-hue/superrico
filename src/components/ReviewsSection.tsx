import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Star } from 'lucide-react'
import PageSection, { SectionHeading, reveal, type Activate } from './PageSection'
import { reviewSummary, reviews } from '../data/reviews'
import { brand, photos } from '../data/sections'

interface Props {
  onActivate: Activate
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          fill={i <= value ? '#F7C948' : 'rgba(255,248,231,0.18)'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

const INITIAL = 6

export default function ReviewsSection({ onActivate }: Props) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? reviews : reviews.slice(0, INITIAL)
  const gallery = [photos.edCheesePull, photos.edBowl, photos.edSharing, photos.edSoda]

  return (
    <PageSection id="reviews" theme="night" onActivate={onActivate} className="py-24 md:py-32 overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-[#F7C948]/10 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 md:gap-20 items-start">
          {/* Summary */}
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Google Reviews"
              title="What Guests Say."
              intro="Real reviews from the Super Rico listing on Google Maps."
            />

            <motion.div className="rounded-[2rem] border border-[#FFF8E7]/10 bg-[#FFF8E7]/[0.04] p-6 md:p-8" {...reveal}>
              <div className="flex items-end gap-5">
                <span className="font-display text-7xl leading-none text-[#F7C948]">{reviewSummary.rating}</span>
                <div className="pb-1">
                  <Stars value={5} size={18} />
                  <p className="mt-1.5 text-sm opacity-70">{reviewSummary.total} reviews on Google</p>
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {reviewSummary.breakdown.map((b) => {
                  const pct = Math.round((b.count / reviewSummary.total) * 100)
                  return (
                    <li key={b.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-3 text-right opacity-70">{b.stars}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#FFF8E7]/10">
                        <motion.div
                          className="h-full rounded-full bg-[#F7C948]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', bounce: 0, duration: 0.9, delay: 0.1 }}
                        />
                      </div>
                      <span className="w-8 text-right opacity-75">{b.count}</span>
                    </li>
                  )
                })}
              </ul>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] opacity-75">Mentioned most</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {reviewSummary.mentioned.map((m) => (
                  <span key={m.label} className="rounded-full border border-[#FFF8E7]/15 px-3 py-1.5 text-xs">
                    {m.label} <span className="opacity-75">· {m.count}</span>
                  </span>
                ))}
              </div>

              <a
                href={brand.maps}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F7C948] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2A1208] press press-lift"
              >
                Read all on Google <ExternalLink size={14} />
              </a>
            </motion.div>

            <motion.div className="grid grid-cols-4 gap-2" {...reveal}>
              {gallery.map((p) => (
                <img key={p.src} src={p.src} alt={p.alt} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              ))}
            </motion.div>
          </div>

          {/* Review cards */}
          <div>
            <motion.ul className="grid sm:grid-cols-2 gap-4" layout>
              <AnimatePresence initial={false}>
                {visible.map((r, i) => (
                  <motion.li
                    key={r.author}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: (i % INITIAL) * 0.04 }}
                    className="flex flex-col rounded-3xl border border-[#FFF8E7]/10 bg-[#FFF8E7]/[0.04] p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Stars value={r.stars} />
                      <span className="text-xs opacity-75">{r.when}</span>
                    </div>
                    {r.highlight ? (
                      <h3 className="mt-4 font-display text-xl leading-snug tracking-wide">“{r.highlight}”</h3>
                    ) : null}
                    <p className="mt-3 text-sm leading-relaxed opacity-75">{r.text}</p>
                    <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[#FFF8E7]/10">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E63946] font-display text-sm uppercase text-[#FFF8E7]">
                        {r.author.slice(0, 1)}
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm font-medium">{r.author}</p>
                        {r.badge ? <p className="text-xs opacity-75">{r.badge} · Google</p> : <p className="text-xs opacity-75">Google</p>}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            {reviews.length > INITIAL ? (
              <div className="mt-8 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="inline-flex items-center rounded-full border border-[#FFF8E7]/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] press hover:bg-[#FFF8E7]/10"
                >
                  {showAll ? 'Show fewer' : `Show all ${reviews.length}`}
                </button>
                <p className="text-xs opacity-75">Captured {reviewSummary.capturedOn}.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PageSection>
  )
}
