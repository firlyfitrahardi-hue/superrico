import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import PageSection, { SPRING, SectionHeading, type Activate } from './PageSection'
import { menu } from '../data/menu'
import { brand } from '../data/sections'

interface Props {
  onActivate: Activate
}

// The panel travels in the direction of the tab you chose, and leaves the opposite way.
const panel = {
  enter: (dir: number) => ({ opacity: 0, x: 24 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -24 * dir }),
}

export default function MenuSection({ onActivate }: Props) {
  const [[activeIndex, dir], setActive] = useState<[number, number]>([0, 1])
  const active = menu[activeIndex]

  const select = (index: number) => {
    if (index === activeIndex) return
    setActive([index, index > activeIndex ? 1 : -1])
  }

  return (
    <PageSection id="menu" theme="cream" onActivate={onActivate} className="py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <SectionHeading
            eyebrow="The Menu"
            title="Built For Sharing."
            intro="Authentic Mexican flavours, adapted for local taste. Portions are generous, so bring friends."
          />
          <div className="flex flex-wrap gap-3">
            <a
              href={brand.gofood}
              target="_blank"
              rel="noreferrer"
              className="press press-lift inline-flex items-center gap-2 rounded-full bg-[#2A1208] text-[#FFF8E7] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em]"
            >
              Order on GoFood <ExternalLink size={14} />
            </a>
            <a
              href={brand.grabfood}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center gap-2 rounded-full border border-[#2A1208]/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#2A1208]/5"
            >
              GrabFood <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-14 flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0" role="tablist" aria-label="Menu categories">
          {menu.map((cat, index) => {
            const selected = index === activeIndex
            return (
              <button
                key={cat.id}
                role="tab"
                id={`menu-tab-${cat.id}`}
                aria-selected={selected}
                aria-controls="menu-panel"
                onClick={() => select(index)}
                className={`press relative shrink-0 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] ${
                  selected ? 'text-[#FFF8E7]' : 'text-[#2A1208]/75 hover:text-[#2A1208] hover:bg-[#2A1208]/5'
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="menu-tab"
                    className="absolute inset-0 rounded-full bg-[#E63946]"
                    // A tap carries no momentum, so the pill settles without overshoot
                    transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                  />
                ) : null}
                <span className="relative">{cat.title}</span>
              </button>
            )
          })}
        </div>

        {/* Category panel */}
        <div
          id="menu-panel"
          role="tabpanel"
          aria-labelledby={`menu-tab-${active.id}`}
          className="mt-10 grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 md:gap-16 items-start"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              className="relative aspect-[4/5] md:aspect-[5/6] rounded-[2rem] overflow-hidden bg-[#2A1208]/10 md:sticky md:top-28"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            >
              <img src={active.image} alt={active.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute left-6 bottom-6 font-display text-3xl md:text-4xl text-[#FFF8E7]">{active.title}</span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={active.id}
              custom={dir}
              variants={panel}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ...SPRING, duration: 0.3 }}
            >
              <p className="text-base md:text-lg opacity-90 max-w-xl">{active.blurb}</p>
              <ul className="mt-8 divide-y divide-[#2A1208]/10">
                {active.items.map((item) => (
                  <li key={item.name} className="py-5 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl md:text-2xl tracking-wide">{item.name}</h3>
                      {item.tags?.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#E63946]/10 text-[#B3202C] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm md:text-base opacity-80 max-w-xl">{item.description}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs opacity-75">Prices and availability may vary. See GoFood or GrabFood for current pricing.</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageSection>
  )
}
