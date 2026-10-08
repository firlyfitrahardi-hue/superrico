import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal behaviour for overlays (mobile drawer, photo lightbox):
 * Escape closes, Tab is trapped inside, page scroll is locked, and focus
 * returns to whatever opened the overlay.
 */
export function useModal(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return

    const opener = document.activeElement as HTMLElement | null
    const focusables = () =>
      ref.current ? Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)) : []

    focusables()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      root.style.overflow = previousOverflow
      opener?.focus?.()
    }
  }, [open, onClose, ref])
}
