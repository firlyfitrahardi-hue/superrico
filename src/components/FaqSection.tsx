import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import PageSection, { SPRING, SectionHeading, reveal, type Activate } from './PageSection'
import { faqs } from '../data/menu'

interface Props {
  onActivate: Activate
}

export default function FaqSection({ onActivate }: Props) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <PageSection id="faq" theme="night" onActivate={onActivate} className="py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12 md:gap-20">
        <SectionHeading eyebrow="FAQ" title="Good To Know." intro="Quick answers before you visit. Anything else, DM us on Instagram." />

        <motion.ul className="divide-y divide-[#FFF8E7]/10 border-y border-[#FFF8E7]/10" {...reveal}>
          {faqs.map((item, i) => {
            const isOpen = open === i
            const panelId = `faq-panel-${i}`
            return (
              <li key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="press-row flex w-full items-center justify-between gap-6 rounded-2xl px-3 -mx-3 py-6 text-left"
                >
                  <span className="font-display text-xl md:text-2xl tracking-wide">{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={SPRING}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7C948] text-[#2A1208]"
                    aria-hidden="true"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="content"
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={SPRING}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-14 text-sm md:text-base leading-relaxed opacity-85">{item.answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            )
          })}
        </motion.ul>
      </div>
    </PageSection>
  )
}
