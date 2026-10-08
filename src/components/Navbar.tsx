import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { Clock, MapPin, Menu as MenuIcon, Star, X } from 'lucide-react'
import { Instagram } from './icons'
import { useModal } from '../hooks/useModal'
import { brand, isLightTheme, themeTextColor } from '../data/sections'
import type { Theme } from '../types'

interface NavbarProps {
  theme: Theme
  /** id of the section currently under the navbar ('hero' for the dish worlds) */
  active: string
}

const links = [
  { label: 'Menu', id: 'menu' },
  { label: 'About', id: 'about' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'Find Us', id: 'find-us' },
  { label: 'FAQ', id: 'faq' },
]

const drawerLinks = [...links, { label: 'Gallery', id: 'gallery' }, { label: 'Reserve a table', id: 'reserve' }]

export default function Navbar({ theme, active }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const color = themeTextColor(theme)
  const onPage = theme === 'cream' || theme === 'night'
  const close = useCallback(() => setOpen(false), [])

  useModal(drawerRef, open, close)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 w-full z-50 transition-[padding] duration-300 ease-out ${
          scrolled ? 'py-4' : 'py-8'
        }`}
        initial={false}
        animate={{ color }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Translucent material, only once content starts scrolling underneath */}
        <div
          className="nav-material"
          data-tone={isLightTheme(theme) ? 'light' : 'dark'}
          style={{ opacity: onPage ? 1 : 0 }}
          aria-hidden="true"
        />

        {/* Page progress: where am I, and how much is left */}
        <motion.div
          className="absolute left-0 top-0 h-[3px] w-full origin-left bg-[#E63946]"
          style={{ scaleX: scrollYProgress }}
          aria-hidden="true"
        />

        <nav className="relative max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between" aria-label="Primary">
          <a
            href="#tacos"
            className="press flex items-center gap-3 font-display text-xl md:text-2xl tracking-[0.2em] select-none leading-none"
            aria-label={`${brand.name} home`}
          >
            <span
              className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF8E7] shadow-md ring-1 ring-black/5 transition-all duration-300 ${
                scrolled ? 'h-11 w-11' : 'h-14 w-14'
              }`}
            >
              <img src={brand.logo} alt="" className="h-full w-full object-contain scale-[1.3]" />
            </span>
            <span className="hidden sm:inline">{brand.name}</span>
          </a>

          <ul className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-[0.22em]">
            <li className="flex items-center gap-2 opacity-80 normal-case tracking-normal font-medium">
              <Clock size={14} strokeWidth={2} />
              <span>{brand.hours}</span>
              <span className="mx-1 opacity-70">·</span>
              <Star size={14} strokeWidth={2} fill="currentColor" />
              <span>{brand.rating}</span>
            </li>
            {links.map(({ label, id }) => {
              const current = active === id
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={current ? 'location' : undefined}
                    className={`press relative inline-block py-2 after:absolute after:left-0 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-current after:transition-all after:duration-300 hover:opacity-100 hover:after:w-full ${
                      current ? 'opacity-100 after:w-full' : 'opacity-80 after:w-0'
                    }`}
                  >
                    {label}
                  </a>
                </li>
              )
            })}
            <li>
              <a
                href="#reserve"
                aria-current={active === 'reserve' ? 'location' : undefined}
                className={`press inline-flex items-center rounded-full border px-5 py-2.5 ${
                  active === 'reserve' ? 'bg-[#E63946] border-[#E63946] text-[#FFF8E7]' : 'border-current hover:bg-current/10'
                }`}
              >
                Reserve
              </a>
            </li>
          </ul>

          <div className="flex md:hidden items-center gap-2">
            <a
              href="#reserve"
              className={`press rounded-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                active === 'reserve' ? 'bg-[#E63946] border-[#E63946] text-[#FFF8E7]' : 'border-current'
              }`}
            >
              Reserve
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="press inline-flex h-11 w-11 items-center justify-center rounded-full -mr-2"
              aria-label="Open menu"
              aria-expanded={open}
              aria-haspopup="dialog"
            >
              <MenuIcon size={22} strokeWidth={1.75} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="drawer"
            ref={drawerRef}
            className="fixed inset-0 z-[60] bg-[#1A0503] text-[#FFF8E7] flex flex-col"
            // Grows out of, and collapses back into, the menu button at the top right
            style={{ transformOrigin: 'calc(100% - 2.5rem) 2.75rem' }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between px-6 py-8">
              <span className="flex items-center gap-3 font-display text-xl tracking-[0.2em]">
                <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#FFF8E7]">
                  <img src={brand.logo} alt="" className="h-full w-full object-contain scale-[1.3]" />
                </span>
                {brand.name}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="press inline-flex h-11 w-11 items-center justify-center rounded-full -mr-2"
              >
                <X size={24} strokeWidth={1.75} />
              </button>
            </div>

            <nav className="flex-1 px-6 flex flex-col justify-center gap-1" aria-label="Site menu">
              {drawerLinks.map(({ label, id }, i) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={close}
                  aria-current={active === id ? 'location' : undefined}
                  className={`font-display text-4xl tracking-wide py-2.5 origin-left ${active === id ? 'text-[#F7C948]' : ''}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.35, delay: 0.03 * i }}
                >
                  {label}
                </motion.a>
              ))}
            </nav>

            <div className="px-6 pb-10 flex items-center justify-between text-sm opacity-80">
              <span className="flex items-center gap-2">
                <Clock size={16} /> {brand.hours}
              </span>
              <span className="flex items-center gap-1">
                <a href={brand.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="press inline-flex h-11 w-11 items-center justify-center rounded-full">
                  <Instagram size={20} />
                </a>
                <a href={brand.maps} target="_blank" rel="noreferrer" aria-label="Google Maps" className="press inline-flex h-11 w-11 items-center justify-center rounded-full">
                  <MapPin size={20} />
                </a>
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
