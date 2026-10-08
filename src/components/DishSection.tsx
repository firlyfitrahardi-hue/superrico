import { useCallback, useEffect, type MouseEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import AlphaVideo from './AlphaVideo'
import Particles from './Particles'
import type { Activate } from './PageSection'
import { themeTextColor } from '../data/sections'
import type { DishSectionData } from '../types'

interface DishSectionProps {
  section: DishSectionData
  index: number
  onActivate: Activate
}

// Entrances play once. Scrolling back to a world shows it immediately.
const VIEWPORT = { once: true, amount: 0.1 } as const

// Critically damped springs with a short stagger: readable in well under half a second.
const enter = (delay: number) => ({ type: 'spring', bounce: 0, duration: 0.6, delay }) as const

export default function DishSection({ section, index, onActivate }: DishSectionProps) {
  const reduceMotion = useReducedMotion()
  const { ref: activeRef, inView } = useInView({ threshold: 0.5 })
  // Looser check, used only to pause decorative animation while the world is off-screen
  const { ref: visibleRef, inView: visible } = useInView({ threshold: 0 })
  const color = themeTextColor(section.type)

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      activeRef(node)
      visibleRef(node)
    },
    [activeRef, visibleRef],
  )

  useEffect(() => {
    if (inView) onActivate(section.type, 'hero')
  }, [inView, onActivate, section.type])

  // 3D mouse parallax: normalised cursor position (0..1) driven through critically damped springs
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springX = useSpring(mouseX, { stiffness: 150, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 25 })
  const rotateX = useTransform(springY, [0, 1], [10, -10])
  const rotateY = useTransform(springX, [0, 1], [-10, 10])

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  const animateDecor = visible && !reduceMotion
  const grounded = Boolean(section.video) && section.videoAnchor === 'bottom'
  const cornered = !section.video && section.imageAnchor === 'bottom-right'

  return (
    <section
      id={section.id}
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-[100dvh] w-full snap-start overflow-hidden"
      style={{ color }}
    >
      {animateDecor ? <Particles theme={section.type} /> : null}

      {/* Layer 1: massive background watermark */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        initial={{ scale: 0.94, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.08 }}
        viewport={VIEWPORT}
        transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
        aria-hidden="true"
      >
        <span className="font-display text-[35vw] md:text-[25vw] leading-none tracking-[-0.04em] uppercase whitespace-nowrap">
          {section.watermark}
        </span>
      </motion.div>

      {/* A photo cropped by the right and bottom of its frame: pin it to that corner of the world,
          so both cuts land on the screen edges. No float or tilt, which would expose them. */}
      {cornered ? (
        <motion.div
          className="pointer-events-none absolute bottom-0 right-0 z-[5]"
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={enter(0)}
        >
          <img
            src={section.image}
            alt={section.alt}
            draggable={false}
            decoding="async"
            loading={index === 0 ? 'eager' : 'lazy'}
            className="block w-[98vw] max-w-[520px] md:w-[52vw] md:max-w-[860px] max-h-[46dvh] md:max-h-[84dvh] object-contain object-right-bottom [filter:drop-shadow(-18px_-10px_40px_rgba(60,20,0,0.3))]"
          />
        </motion.div>
      ) : null}

      <div
        className={`relative z-10 flex items-center gap-6 md:gap-12 max-w-[1400px] w-full h-full mx-auto px-6 md:px-12 pt-24 md:py-0 ${
          cornered ? 'flex-col justify-start md:flex-row' : 'flex-col-reverse md:flex-row justify-between'
        } ${grounded ? 'pb-0' : 'pb-6'}`}
      >
        {/* Layer 2: dish photo card (skipped when the dish is pinned to the corner instead) */}
        {cornered ? null : (
        <motion.div
          className={`w-full md:flex-1 flex justify-center md:justify-start items-end ${
            grounded ? 'md:self-stretch' : 'md:items-center'
          }`}
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={enter(0)}
          style={{ perspective: 1400 }}
        >
          <motion.div
            // A grounded dish stands on the bottom edge, so it does not bob
            animate={animateDecor && !grounded ? { y: [0, -12, 0] } : { y: 0 }}
            transition={animateDecor && !grounded ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          >
            {section.video && grounded ? (
              // Transparent video cut off by the bottom of its frame: stand it on the bottom edge
              // of the world so the cut is never seen. No tilt or float, which would expose it.
              <div
                className="relative w-[94vw] max-w-[520px] md:w-[48vw] md:max-w-[720px]"
                style={{
                  aspectRatio: section.videoAspect ?? 1.4,
                  // Steam can reach the top of the clip: fade it out instead of ending in a hard line
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 16%)',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, #000 16%)',
                }}
              >
                <AlphaVideo
                  src={section.video}
                  poster={section.videoPoster ?? section.image}
                  alt={section.alt}
                  play={animateDecor}
                  loopFade={section.videoLoopFade}
                  anchorBottom
                  preload={index === 0 ? 'auto' : 'metadata'}
                  className="h-full w-full"
                />
              </div>
            ) : section.video ? (
              // Transparent video: the dish rotates and steams over the world, no frame
              <motion.div
                className="relative h-[32vh] sm:h-[42vh] md:h-[58vh] max-w-[88vw] md:max-w-[46vw]"
                style={{
                  aspectRatio: section.videoAspect ?? 1.3,
                  ...(reduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' as const }),
                }}
              >
                {/* A static contact shadow costs nothing per frame, unlike a filter on a live canvas */}
                <div
                  className="pointer-events-none absolute left-[12%] right-[12%] -bottom-[4%] h-[14%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(60,20,0,0.38),transparent)] blur-md"
                  aria-hidden="true"
                />
                <AlphaVideo
                  src={section.video}
                  poster={section.videoPoster ?? section.image}
                  alt={section.alt}
                  play={animateDecor}
                  loopFade={section.videoLoopFade}
                  preload={index === 0 ? 'auto' : 'metadata'}
                  className="h-full w-full"
                />
              </motion.div>
            ) : section.cutout ? (
              // Transparent cutout: the dish itself floats over the world, no frame
              <motion.div
                className="relative flex items-center justify-center w-[82vw] max-w-[460px] md:w-[46vw] md:max-w-[680px] h-[36vh] sm:h-[46vh] md:h-[66vh]"
                style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
              >
                <img
                  src={section.image}
                  alt={section.alt}
                  draggable={false}
                  decoding="async"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="max-h-full max-w-full object-contain [filter:drop-shadow(0_36px_28px_rgba(60,20,0,0.38))]"
                />
              </motion.div>
            ) : (
              <motion.div
                className="relative h-[38vh] sm:h-[52vh] md:h-[72vh] aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/20"
                style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
              >
                <img
                  src={section.image}
                  alt={section.alt}
                  draggable={false}
                  decoding="async"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
                <span className="absolute left-5 bottom-4 font-display text-lg md:text-2xl tracking-[0.15em] uppercase text-[#FFF8E7] drop-shadow">
                  {section.watermark}
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        )}

        {/* Layer 3: typography content block */}
        <motion.div
          className={`flex flex-col justify-center items-center md:items-start text-center md:text-left ${
            cornered ? 'md:max-w-[40vw] xl:max-w-xl' : 'flex-1 max-w-xl'
          }`}
          initial={{ opacity: 0, x: cornered ? -32 : 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={enter(0.06)}
        >
          <p className="mb-4 md:mb-6 text-xs font-semibold uppercase tracking-[0.3em] opacity-80">{section.label}</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl tracking-tight leading-[1.08] drop-shadow-lg whitespace-pre-line">
            {section.subtitle}
          </h2>
          <p className="mt-4 md:mt-8 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-md whitespace-pre-line opacity-90">
            {section.description}
          </p>
          <div className="mt-5 md:mt-10 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <a
              href="#reserve"
              className="press inline-flex items-center rounded-full border border-current px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] hover:bg-current/10"
            >
              Reserve a table
            </a>
            <a
              href="#menu"
              className="press inline-flex items-center rounded-full px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] opacity-80 hover:opacity-100"
            >
              See the menu →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
