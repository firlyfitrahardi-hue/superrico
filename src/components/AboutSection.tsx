import { motion } from 'framer-motion'
import { CalendarDays, Check, Flame, Leaf, PartyPopper, Star } from 'lucide-react'
import PageSection, { SectionHeading, reveal, type Activate } from './PageSection'
import { amenities, brand, photos, upcomingEvent } from '../data/sections'

interface Props {
  onActivate: Activate
}

const values = [
  { icon: Flame, title: 'Authentic Heat', text: 'Birria braised low and slow, hard shells fried to order, salsas and guac made fresh daily.' },
  { icon: Leaf, title: 'Made Local', text: 'Flavours tuned for Indonesian palates. No pork, no lard. Beef, chicken, shrimp and fish only.' },
  { icon: Star, title: `Rated ${brand.rating} on Google`, text: `${brand.reviewCount} reviews from neighbours in Gading Serpong, most of them five stars.` },
  { icon: PartyPopper, title: 'Events & Member Club', text: 'Stamp card perks, food festivals, birthdays and office lunches. Ask our team or DM us.' },
]

export default function AboutSection({ onActivate }: Props) {
  return (
    <PageSection id="about" theme="night" onActivate={onActivate} className="py-24 md:py-32 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] font-display text-[30vw] leading-none uppercase flex items-center justify-center select-none"
        aria-hidden="true"
      >
        Rico
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-14 md:gap-20 items-center">
          <div className="flex flex-col gap-10">
            <SectionHeading
              eyebrow="About Super Rico"
              title="Mexican Fusion, Made Local."
              intro="Super Rico started with a simple idea: bring the bold, generous flavours of Mexican street food to Gading Serpong, and make it feel like home. Tacos, burritos, bowls and quesadillas, cooked fresh in a small two-floor ruko in Aniva Grande, and tuned for the way we like to eat here."
            />
            <motion.ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-light" {...reveal}>
              {amenities.map((a) => (
                <li key={a} className="flex items-center gap-2.5 opacity-85">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2F8F46] text-[#FFF8E7]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {a}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div className="relative" {...reveal}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl">
              <img src={photos.edKitchen.src} alt={photos.edKitchen.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-4 md:-left-10 w-44 md:w-56 aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-[#1A0503]">
              <img src={photos.storefront.src} alt={photos.storefront.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </motion.div>
        </div>

        <div className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              className="rounded-3xl border border-[#FFF8E7]/10 bg-[#FFF8E7]/5 p-6"
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.08 * i }}
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F7C948] text-[#2A1208]">
                <Icon size={20} strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-display text-xl tracking-wide">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* Upcoming event */}
        <motion.div
          className="mt-10 grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden rounded-[2rem] bg-[#F7C948] text-[#2A1208]"
          {...reveal}
        >
          <div className="relative min-h-[260px] md:min-h-0">
            <img src={upcomingEvent.image} alt={photos.event.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-75">{upcomingEvent.eyebrow}</p>
            <h3 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">{upcomingEvent.title}</h3>
            <p className="mt-5 flex items-center gap-2 text-sm font-medium">
              <CalendarDays size={16} /> {upcomingEvent.dates}
            </p>
            <p className="mt-1 text-sm opacity-80">{upcomingEvent.venue}</p>
            <p className="mt-4 text-sm opacity-70">{upcomingEvent.note}</p>
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex w-fit items-center rounded-full bg-[#2A1208] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF8E7] press press-lift"
            >
              Follow for updates
            </a>
          </div>
        </motion.div>
      </div>
    </PageSection>
  )
}
