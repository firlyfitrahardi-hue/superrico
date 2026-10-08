import { motion } from 'framer-motion'
import { Clock, MapPin, Navigation, ShoppingBag } from 'lucide-react'
import { Instagram } from './icons'
import PageSection, { SectionHeading, reveal, type Activate } from './PageSection'
import { brand } from '../data/sections'

interface Props {
  onActivate: Activate
}

export default function FindUsSection({ onActivate }: Props) {
  return (
    <PageSection id="find-us" theme="cream" onActivate={onActivate} className="py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 md:gap-16 items-stretch">
        <div className="flex flex-col gap-10">
          <SectionHeading eyebrow="Find Us" title="Gading Serpong." intro="Ruko Aniva Grande, a short drive from Summarecon Mall Serpong. Parking in front." />

          <motion.div className="grid sm:grid-cols-2 gap-5" {...reveal}>
            <div className="rounded-3xl bg-[#2A1208]/5 p-6">
              <MapPin size={20} className="text-[#E63946]" />
              <h3 className="mt-4 font-display text-xl tracking-wide">Address</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-80">{brand.addressFull}</p>
              <a href={brand.maps} target="_blank" rel="noreferrer" className="press mt-3 inline-flex items-center gap-2 rounded-full py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B3202C]">
                <Navigation size={14} /> Get directions
              </a>
            </div>
            <div className="rounded-3xl bg-[#2A1208]/5 p-6">
              <Clock size={20} className="text-[#E63946]" />
              <h3 className="mt-4 font-display text-xl tracking-wide">Hours</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-80">
                {brand.hoursNote}
                <br />
                {brand.hours}
              </p>
              <p className="mt-4 text-xs opacity-75">Google rating {brand.rating} ★</p>
            </div>
            <div className="rounded-3xl bg-[#2A1208]/5 p-6">
              <ShoppingBag size={20} className="text-[#E63946]" />
              <h3 className="mt-4 font-display text-xl tracking-wide">Delivery</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-80">{brand.delivery}</p>
              <div className="mt-3 flex gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#B3202C]">
                <a href={brand.gofood} target="_blank" rel="noreferrer" className="press py-2">GoFood</a>
                <a href={brand.grabfood} target="_blank" rel="noreferrer" className="press py-2">GrabFood</a>
              </div>
            </div>
            <div className="rounded-3xl bg-[#2A1208]/5 p-6">
              <Instagram size={20} className="text-[#E63946]" />
              <h3 className="mt-4 font-display text-xl tracking-wide">Say Hi</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-80">Events, catering and member club questions. DM us any time.</p>
              <a href={brand.instagram} target="_blank" rel="noreferrer" className="press mt-3 inline-flex items-center gap-2 rounded-full py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B3202C]">
                {brand.instagramHandle}
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div className="relative min-h-[360px] md:min-h-full overflow-hidden rounded-[2rem] bg-[#2A1208]/10" {...reveal}>
          <iframe
            title="Super Rico on Google Maps"
            src={brand.mapsEmbed}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </motion.div>
      </div>
    </PageSection>
  )
}
