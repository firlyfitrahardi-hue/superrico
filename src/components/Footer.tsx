import { MapPin } from 'lucide-react'
import { Instagram } from './icons'
import PageSection, { type Activate } from './PageSection'
import { brand } from '../data/sections'

interface Props {
  onActivate: Activate
}

const explore = [
  { label: 'Menu', href: '#menu' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Reserve', href: '#reserve' },
  { label: 'Find Us', href: '#find-us' },
  { label: 'FAQ', href: '#faq' },
]

export default function Footer({ onActivate }: Props) {
  return (
    <PageSection id="footer" theme="night" onActivate={onActivate} className="pt-20 pb-10 border-t border-[#FFF8E7]/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <a href="#tacos" className="flex items-center gap-4 font-display text-3xl tracking-[0.2em]">
              <span className="inline-flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF8E7]">
                <img src={brand.logo} alt="Super Rico logo" className="h-full w-full object-contain scale-[1.3]" />
              </span>
              {brand.name}
            </a>
            <p className="mt-3 text-sm opacity-70">{brand.tagline}</p>
            <div className="mt-6 flex gap-3">
              <a href={brand.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="press inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFF8E7]/20 hover:bg-[#FFF8E7]/10">
                <Instagram size={16} />
              </a>
              <a href={brand.maps} target="_blank" rel="noreferrer" aria-label="Google Maps" className="press inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFF8E7]/20 hover:bg-[#FFF8E7]/10">
                <MapPin size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] opacity-75">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm font-light">
              {explore.map((l) => (
                <li key={l.label}><a href={l.href} className="press inline-block py-1 opacity-85 hover:opacity-100">{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] opacity-75">Order</h4>
            <ul className="mt-4 space-y-2.5 text-sm font-light">
              <li><a href={brand.gofood} target="_blank" rel="noreferrer" className="press inline-block py-1 opacity-85 hover:opacity-100">GoFood</a></li>
              <li><a href={brand.grabfood} target="_blank" rel="noreferrer" className="press inline-block py-1 opacity-85 hover:opacity-100">GrabFood</a></li>
              <li><a href="#reserve" className="press inline-block py-1 opacity-85 hover:opacity-100">Reserve a table</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] opacity-75">Visit</h4>
            <p className="mt-4 text-sm leading-relaxed opacity-80">{brand.addressFull}</p>
            <p className="mt-3 text-sm opacity-80">{brand.hoursNote} · {brand.hours}</p>
          </div>
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#FFF8E7]/10 pt-6 text-xs opacity-75">
          <span>© {new Date().getFullYear()} Super Rico Indonesia. All rights reserved.</span>
          <span>{brand.instagramHandle}</span>
        </div>
      </div>
    </PageSection>
  )
}
