import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { gradients, themeTextColor } from '../data/sections'
import type { PageTheme, Theme } from '../types'

export type Activate = (theme: Theme, id: string) => void

interface PageSectionProps {
  id: string
  theme: PageTheme
  onActivate: Activate
  className?: string
  children: ReactNode
}

/** Critically damped spring: quick, no overshoot. The house default for UI motion. */
export const SPRING = { type: 'spring', bounce: 0, duration: 0.4 } as const

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { type: 'spring', bounce: 0, duration: 0.7 },
} as const

/**
 * A normal flowing section below the four dish worlds. Reports its theme and id to the navbar
 * when it sits under the header (a thin band 15% to 25% down the viewport).
 */
export default function PageSection({ id, theme, onActivate, className = '', children }: PageSectionProps) {
  const { ref, inView } = useInView({ rootMargin: '-15% 0px -75% 0px', threshold: 0 })

  useEffect(() => {
    if (inView) onActivate(theme, id)
  }, [inView, onActivate, theme, id])

  return (
    <section
      id={id}
      ref={ref}
      className={`relative w-full ${className}`}
      style={{ background: gradients[theme], color: themeTextColor(theme) }}
    >
      {children}
    </section>
  )
}

interface SectionHeadingProps {
  eyebrow: string
  title: string
  intro?: string
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, intro, align = 'left' }: SectionHeadingProps) {
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  return (
    <motion.div className={`flex flex-col ${alignCls} max-w-2xl`} {...reveal}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] opacity-75">{eyebrow}</p>
      <h2 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">{title}</h2>
      {intro ? <p className="mt-5 text-base md:text-lg leading-relaxed opacity-90">{intro}</p> : null}
    </motion.div>
  )
}
