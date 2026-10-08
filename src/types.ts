export type DishTheme = 'tacos' | 'burrito' | 'bowl' | 'nachos'

/** Themes for the flowing page below the four dish worlds. */
export type PageTheme = 'cream' | 'night'

export type Theme = DishTheme | PageTheme

export interface DishSectionData {
  id: string
  type: DishTheme
  watermark: string
  label: string
  subtitle: string
  description: string
  image: string
  alt: string
  /** true when `image` is a transparent cutout: it floats over the world instead of sitting in a card */
  cutout?: boolean
  /**
   * 'bottom-right' when a cutout photo is cropped by the right and bottom edges of its frame.
   * The dish is then pinned to that corner of the world, so both cuts sit on the screen edges,
   * and the copy moves to the left.
   */
  imageAnchor?: 'bottom-right'
  /** Optional stacked-alpha clip (see scripts/key-video.mjs). When set, it plays instead of `image`. */
  video?: string
  /** Transparent first frame of `video`, shown while it loads and for reduced motion */
  videoPoster?: string
  /** Width / height of the keyed clip, so the layout reserves the right box before it loads */
  videoAspect?: number
  /**
   * 'bottom' when the clip is cut off by the bottom of the frame (the dish stands on a surface).
   * It is then anchored to the bottom edge of the world instead of floating, so the cut never shows.
   */
  videoAnchor?: 'bottom'
  /** Seconds of fade at the loop point. Use 0 for a clip that loops seamlessly. Default 0.3. */
  videoLoopFade?: number
}

export interface MenuItem {
  name: string
  description: string
  tags?: string[]
}

export interface MenuCategory {
  id: string
  title: string
  blurb: string
  image: string
  items: MenuItem[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface ReservationRequest {
  name: string
  phone: string
  date: string
  time: string
  guests: number
  notes: string
}

export interface Photo {
  src: string
  alt: string
  credit?: string
}
