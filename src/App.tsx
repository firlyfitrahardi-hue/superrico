import { useCallback, useEffect, useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import DishSection from './components/DishSection'
import Marquee from './components/Marquee'
import MenuSection from './components/MenuSection'
import AboutSection from './components/AboutSection'
import GallerySection from './components/GallerySection'
import ReviewsSection from './components/ReviewsSection'
import ReservationSection from './components/ReservationSection'
import FindUsSection from './components/FindUsSection'
import FaqSection from './components/FaqSection'
import Footer from './components/Footer'
import { gradients, sections } from './data/sections'
import type { Theme } from './types'

export default function App() {
  // Two layers so worlds cross-fade directly into each other, never through black.
  const [bg, setBg] = useState<{ prev: Theme; cur: Theme }>({ prev: 'tacos', cur: 'tacos' })
  const [activeSection, setActiveSection] = useState('hero')

  const handleActivate = useCallback((theme: Theme, id: string) => {
    setBg((b) => (b.cur === theme ? b : { prev: b.cur, cur: theme }))
    setActiveSection(id)
  }, [])

  // Deep links (/#reserve etc.) arrive before React has rendered the anchors, so jump once mounted.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    const frame = requestAnimationFrame(() => {
      // 'instant', not 'auto': auto would inherit the page's smooth scrolling, and a smooth
      // scroll across the snapping dish worlds can settle on the wrong one.
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    // reducedMotion="user": people who ask for reduced motion get opacity cross-fades
    // instead of slides, springs and layout movement, everywhere, automatically.
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-[-1]" style={{ background: gradients[bg.prev] }} aria-hidden="true">
        <motion.div
          key={bg.cur}
          className="absolute inset-0"
          style={{ background: gradients[bg.cur] }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </div>

      <Navbar theme={bg.cur} active={activeSection} />

      <main>
        {/* Cinematic hero: the four dish worlds */}
        {sections.map((section, index) => (
          <DishSection key={section.id} section={section} index={index} onActivate={handleActivate} />
        ))}

        <Marquee />
        <MenuSection onActivate={handleActivate} />
        <AboutSection onActivate={handleActivate} />
        <GallerySection onActivate={handleActivate} />
        <ReviewsSection onActivate={handleActivate} />
        <Marquee dark />
        <ReservationSection onActivate={handleActivate} />
        <FindUsSection onActivate={handleActivate} />
        <FaqSection onActivate={handleActivate} />
      </main>

      <Footer onActivate={handleActivate} />
    </MotionConfig>
  )
}
