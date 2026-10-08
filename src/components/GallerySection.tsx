import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Instagram } from './icons'
import PageSection, { SectionHeading, reveal, type Activate } from './PageSection'
import { useModal } from '../hooks/useModal'
import { brand, photos } from '../data/sections'
import type { Photo } from '../types'

interface Props {
  onActivate: Activate
}

interface Tile {
  photo: Photo
  caption: string
  span?: string
}

// Editorial food shots carry the mood; the three photos of the real place stay for authenticity.
const tiles: Tile[] = [
  { photo: photos.edTable, caption: 'Built for sharing', span: 'md:col-span-2 md:row-span-2' },
  { photo: photos.edConsomme, caption: 'Birria, dipped' },
  { photo: photos.dineIn, caption: 'The dining room' },
  { photo: photos.edCheesePull, caption: 'Hard shell, soft cheese' },
  { photo: photos.edTortillaPress, caption: 'Pressed fresh' },
  { photo: photos.edSalsas, caption: 'House salsas' },
  { photo: photos.storefront, caption: 'Aniva Grande GE 5' },
  { photo: photos.memberClub, caption: 'Member Club stamp card', span: 'md:col-span-2' },
  { photo: photos.edSoda, caption: 'Super Soda, lime' },
  { photo: photos.edShreddedBeef, caption: 'Slow-cooked beef' },
]

const layoutSpring = { type: 'spring', bounce: 0, duration: 0.4 } as const

export default function GallerySection({ onActivate }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpenIndex(null), [])
  const selected = openIndex === null ? null : tiles[openIndex]

  useModal(dialogRef, selected !== null, close)

  return (
    <PageSection id="gallery" theme="cream" onActivate={onActivate} className="py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading eyebrow="Gallery" title="A Look Inside." intro="Our food, our space, and the people who make it. Tap a photo to see it larger." />
          <a
            href={brand.instagram}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center gap-2 rounded-full py-2 text-xs font-semibold uppercase tracking-[0.22em] opacity-85 hover:opacity-100"
          >
            <Instagram size={16} /> Follow {brand.instagramHandle}
          </a>
        </div>

        <ul className="mt-12 grid grid-cols-2 md:grid-cols-4 auto-rows-[170px] md:auto-rows-[230px] gap-3 md:gap-4">
          {tiles.map((tile, i) => (
            <motion.li
              key={tile.photo.src}
              className={`relative ${tile.span ?? ''}`}
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.03 * i }}
            >
              {/* A real button: the hover zoom now promises something, and delivers it */}
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`View photo: ${tile.caption}`}
                className="press group absolute inset-0 overflow-hidden rounded-3xl bg-[#2A1208]/10 text-left"
              >
                <motion.img
                  layoutId={`gallery-${tile.photo.src}`}
                  transition={layoutSpring}
                  src={tile.photo.src}
                  alt={tile.photo.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pb-3 pt-10 text-[#FFF8E7]">
                  <span className="font-display text-base md:text-lg tracking-wide">{tile.caption}</span>
                  {tile.photo.credit ? <span className="ml-2 text-xs uppercase tracking-[0.14em] opacity-80">{tile.photo.credit}</span> : null}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Lightbox: the photo grows out of its tile and returns to it. Dimmed scrim marks it as modal. */}
      <AnimatePresence>
        {selected ? (
          <motion.div
            key="lightbox"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={selected.caption}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 md:p-10 text-[#FFF8E7]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close photo"
              onClick={close}
              className="press absolute right-4 top-4 md:right-8 md:top-8 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF8E7] text-[#2A1208] shadow-lg"
            >
              <X size={22} strokeWidth={2} />
            </button>
            <div className="glass absolute inset-0 bg-black/80 backdrop-blur-md" onClick={close} aria-hidden="true" />
            <motion.img
              layoutId={`gallery-${selected.photo.src}`}
              transition={layoutSpring}
              src={selected.photo.src}
              alt={selected.photo.alt}
              className="relative max-h-[78vh] max-w-full rounded-3xl object-contain shadow-2xl"
            />
            <p className="relative mt-5 text-center">
              <span className="font-display text-xl tracking-wide">{selected.caption}</span>
              {selected.photo.credit ? <span className="ml-3 text-xs uppercase tracking-[0.14em] opacity-80">{selected.photo.credit}</span> : null}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageSection>
  )
}
