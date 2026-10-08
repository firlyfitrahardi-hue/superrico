import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { particleColors } from '../data/sections'
import type { DishTheme } from '../types'

interface Particle {
  id: number
  size: number
  x: number
  y: number
  duration: number
  delay: number
  color: string
  drift: number
}

interface ParticlesProps {
  theme: DishTheme
  count?: number
}

const random = (min: number, max: number) => Math.random() * (max - min) + min

/**
 * Decorative drifting particles. The parent only mounts this while its world is on screen
 * and the user has not asked for reduced motion, so nothing animates off-screen.
 * Only transform and opacity change, with no shadows, to keep each frame cheap.
 */
export default function Particles({ theme, count = 14 }: ParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    const palette = particleColors[theme]
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: random(3, 7),
      x: random(0, 100),
      y: random(0, 100),
      duration: random(15, 30),
      delay: random(-20, 0),
      color: palette[i % palette.length],
      drift: random(-40, 40),
    }))
  }, [theme, count])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: [0, -140, 0],
            x: [0, p.drift, 0],
            opacity: [0, 0.7, 0.35, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
