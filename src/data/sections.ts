import type { DishSectionData, DishTheme, Photo, Theme } from '../types'
import { asset } from './asset'

export const brand = {
  name: 'SUPER RICO',
  tagline: 'Mexican Fusion, Made Local',
  address: 'Aniva Grande Blok GE No. 5, Gading Serpong',
  addressFull: 'Aniva Grande, Blok GE. 5, Medang, Pagedangan, Tangerang Regency, Banten 15334',
  hours: '10.00 – 21.00',
  hoursNote: 'Open daily',
  rating: '4.7',
  reviewCount: 231,
  priceRange: 'Rp 50–100K per person',
  instagram: 'https://www.instagram.com/superrico.id/',
  instagramHandle: '@superrico.id',
  tiktokHandle: '@superrico_id',
  maps: 'https://maps.app.goo.gl/vMRsTpa85D6d45bdA',
  mapsEmbed:
    'https://www.google.com/maps?q=-6.2733827,106.6190492(Super%20Rico)&z=17&output=embed',
  delivery: 'Available on GoFood & GrabFood',
  gofood: 'https://gofood.co.id/',
  grabfood: 'https://food.grab.com/id/en/',
  logo: asset('/images/brand/logo-256.png'),
  /**
   * WhatsApp number for reservations in international format without "+" (e.g. 628123456789).
   * Leave empty until the restaurant provides one; the form then falls back to a copyable message.
   */
  whatsapp: '',
  /** Earliest and latest seating times, 24h format. */
  firstSeating: '10:00',
  lastSeating: '20:30',
  maxGuests: 20,
}

/** Facts from the Google Maps "About" tab and recent reviews. */
export const amenities = [
  'Dine-in & takeaway',
  'No pork, no lard',
  'Two floors of seating',
  'Free parking',
  'Free-refill iced tea',
  'Debit cards accepted',
  'Casual · Cosy · Trendy',
  'Good for groups',
]

export const upcomingEvent = {
  eyebrow: 'Our second event',
  title: 'Downtown Walk Food Festival',
  dates: '8 – 25 October 2026',
  venue: 'Downtown Unity, Summarecon Mal Serpong',
  note: 'Come by our booth. By Pergikuliner Events.',
  image: asset('/images/ig/ig-12.webp'),
}

export const sections: DishSectionData[] = [
  {
    id: 'tacos',
    type: 'tacos',
    watermark: 'Tacos',
    label: 'Signature · Hard Shell',
    subtitle: 'Crunchy. Loaded.\nUnapologetically Rico.',
    description:
      'Hard-shell tacos with birria, pulled beef,\nshrimp, fish or beef tongue.\n\nThe first thing you should order here.',
    image: asset('/images/hero/tacos.webp'),
    alt: 'Two crispy birria tacos filled with pulled beef, melted cheese, onion and cilantro',
    cutout: true,
    // Remove the video lines below to go back to the still photo.
    video: asset('/videos/tacos.mp4'),
    videoPoster: asset('/images/hero/tacos-video-poster.webp'),
    videoAspect: 980 / 720,
    videoAnchor: 'bottom', // this clip is cut off at the bottom of its frame, so it stands on the bottom edge
  },
  {
    id: 'burrito',
    type: 'burrito',
    watermark: 'Burrito',
    label: 'Crowd Favourite',
    subtitle: 'Wrapped Tight.\nPacked With Flavor.',
    description:
      'Pulled beef or chicken, rolled with cheese\nand your choice of rice or fries inside.\n\nBig enough to share. Good enough not to.',
    image: asset('/images/gmaps/menu-10.webp'),
    alt: 'Super Rico pulled beef burrito cut in half with lime',
    // Remove the lines below to go back to the framed photo.
    video: asset('/videos/burrito.mp4'),
    videoPoster: asset('/images/hero/burrito-video-poster.webp'),
    videoAspect: 1030 / 720,
    videoAnchor: 'bottom', // the clip is cut off at the bottom of its frame, so it stands on the bottom edge
    videoLoopFade: 0, // a full rotation: loops without a fade
  },
  {
    id: 'bowl',
    type: 'bowl',
    watermark: 'Bowl',
    label: 'Burrito Bowl',
    subtitle: 'Fresh. Bold.\nPerfectly Balanced.',
    description:
      'Pulled beef, grilled chicken or ground beef\nover rice with corn, beans and crema.\n\nSavory, tangy, and just the right heat.',
    image: asset('/images/hero/bowl.webp'),
    alt: 'Burrito bowl with grilled chicken, black beans, corn, lettuce, jalapeño and crema',
    cutout: true,
    // Remove the video lines below to go back to the still photo.
    video: asset('/videos/bowl.mp4'),
    videoPoster: asset('/images/hero/bowl-video-poster.webp'),
    videoAspect: 968 / 720,
    videoAnchor: 'bottom', // the bowl is cut off at the bottom of the frame, so it stands on the bottom edge
  },
  {
    id: 'nachos',
    type: 'nachos',
    watermark: 'Nachos',
    label: 'Made To Share',
    subtitle: 'Share The Fiesta.',
    description:
      'Loaded nachos, Rico wings, chips with guac\nand a Super Soda to wash it all down.\n\nMexican fusion, made local in Gading Serpong.',
    image: asset('/images/hero/nachos.webp'),
    alt: 'A plate of loaded nachos with seasoned beef, guacamole, pico de gallo, melted cheese and sour cream',
    cutout: true,
    // Remove the video lines below to go back to the still photo.
    video: asset('/videos/nachos.mp4'),
    videoPoster: asset('/images/hero/nachos-video-poster.webp'),
    videoAspect: 1280 / 720,
    videoAnchor: 'bottom', // the plate is cut off at the bottom of the frame at the loop point, so it stands on the bottom edge
    videoLoopFade: 0, // first and last frames match: loops without a fade
  },
]

export const gradients: Record<Theme, string> = {
  tacos: 'radial-gradient(circle at center, #FFF6D6 0%, #F7C948 45%, #B5701A 100%)',
  burrito: 'radial-gradient(circle at center, #E8432E 0%, #8A1C12 50%, #1A0503 100%)',
  bowl: 'radial-gradient(circle at center, #8FD36B 0%, #2F6B1F 45%, #0A1A06 100%)',
  nachos: 'radial-gradient(circle at center, #FFF0D6 0%, #F6A04D 45%, #7A3410 100%)',
  cream: '#FFF8E7',
  night: '#1A0503',
}

export const lightThemes: Theme[] = ['tacos', 'nachos', 'cream']

export const isLightTheme = (theme: Theme) => lightThemes.includes(theme)

export const themeTextColor = (theme: Theme) => (isLightTheme(theme) ? '#2A1208' : '#FFF8E7')

export const particleColors: Record<DishTheme, string[]> = {
  tacos: ['#E63946', '#FFE08A', '#FFF8E7', '#2F8F46'],
  burrito: ['#FFB703', '#FF7B54', '#FFE5B4', '#F4A261'],
  bowl: ['#C7F09A', '#FFE08A', '#F1FAEE', '#E63946'],
  nachos: ['#E63946', '#FFD166', '#FFF8E7', '#2F8F46'],
}

export const marqueeWords = ['Tacos', 'Burritos', 'Birria', 'Nachos', 'Made Local', 'Gading Serpong']

/** Real photos from Instagram @superrico.id and the Google Maps listing. */
export const photos: Record<string, Photo> = {
  storefront: { src: asset('/images/gmaps/storefront.webp'), alt: 'Super Rico storefront in Aniva Grande with the sombrero sign', credit: 'Google Maps' },
  dineIn: { src: asset('/images/gmaps/dine-in.webp'), alt: 'Super Rico dining room with Mexican murals', credit: 'Google Maps' },
  tvShow: { src: asset('/images/ig/ig-06.webp'), alt: 'Guests in sombreros filming a TV show at Super Rico', credit: 'Instagram' },
  interiorBurrito: { src: asset('/images/ig/ig-09.webp'), alt: 'A guest holding a burrito inside Super Rico', credit: 'Instagram' },
  exterior: { src: asset('/images/ig/ig-10.webp'), alt: 'Outside Super Rico on a sunny afternoon', credit: 'Instagram' },
  team: { src: asset('/images/ig/ig-11.webp'), alt: 'Super Rico team at the front door', credit: 'Instagram' },
  kitchen: { src: asset('/images/ig/ig-03.webp'), alt: 'The owner plating a taco platter in the Super Rico kitchen', credit: 'Instagram' },
  memberClub: { src: asset('/images/ig/ig-02.webp'), alt: 'Super Rico Member Club stamp card', credit: 'Instagram' },
  pepperoniTacos: { src: asset('/images/ig/ig-01.webp'), alt: 'Pepperoni tacos, the new Tex-Mex menu', credit: 'Instagram' },
  birria: { src: asset('/images/ig/ig-04.webp'), alt: 'Birria taco with consommé', credit: 'Instagram' },
  friesDips: { src: asset('/images/gmaps/highlight-02.webp'), alt: 'Homemade fries with guacamole and salsa', credit: 'Google Maps' },
  chipsGuac: { src: asset('/images/gmaps/menu-07.webp'), alt: 'Tortilla chips with guacamole', credit: 'Google Maps' },
  wings: { src: asset('/images/gmaps/menu-11.webp'), alt: 'Rico wings with salsa', credit: 'Google Maps' },
  quesadilla: { src: asset('/images/gmaps/menu-12.webp'), alt: 'Cheese quesadilla with sour cream', credit: 'Google Maps' },
  burritoChips: { src: asset('/images/gmaps/menu-08.webp'), alt: 'Burrito with tortilla chips', credit: 'Google Maps' },
  tacosPlate: { src: asset('/images/gmaps/review-honesteater-3.webp'), alt: 'Hard-shell tacos on the table', credit: 'Google Maps' },
  burritoHalves: { src: asset('/images/gmaps/review-kezya-3.webp'), alt: 'Pulled beef burrito halves', credit: 'Google Maps' },
  nachos: { src: asset('/images/gmaps/menu-09.webp'), alt: 'Loaded nachos', credit: 'Google Maps' },
  bowls: { src: asset('/images/gmaps/bowls.webp'), alt: 'Grilled chicken bowl and ground beef bowl', credit: 'Google Maps' },
  shrimpTacos: { src: asset('/images/gmaps/shrimp-tacos.webp'), alt: 'Shrimp tacos, hard shell', credit: 'Google Maps' },
  event: { src: asset('/images/ig/ig-12.webp'), alt: 'Downtown Walk Food Festival poster', credit: 'Instagram' },

  // Editorial set (generated, see README): one consistent shoot for the sections below the hero
  edTacos: { src: asset('/images/editorial/tacos.webp'), alt: 'Two birria tacos with a bowl of consommé on a terracotta plate' },
  edBurrito: { src: asset('/images/editorial/burrito.webp'), alt: 'Pulled beef burrito sliced in half with tortilla chips and lime' },
  edBowl: { src: asset('/images/editorial/bowl.webp'), alt: 'Burrito bowl with rice, black beans, grilled chicken, corn, pico and crema, from above' },
  edQuesadilla: { src: asset('/images/editorial/quesadilla.webp'), alt: 'Cheese quesadilla wedges with a cheese pull, sour cream and salsa' },
  edSharing: { src: asset('/images/editorial/sharing.webp'), alt: 'Loaded nachos and glazed chicken wings on a wooden board' },
  edDrinks: { src: asset('/images/editorial/drinks.webp'), alt: 'Two glasses of lime soda with ice beside a basket of fries and dips' },
  edKitchen: { src: asset('/images/editorial/kitchen-taco.webp'), alt: 'A cook assembling a hard-shell taco on a steel counter' },
  edTortillaPress: { src: asset('/images/editorial/tortilla-press.webp'), alt: 'Hands pressing a corn tortilla in a cast iron press' },
  edSalsas: { src: asset('/images/editorial/salsas.webp'), alt: 'Three house salsas with lime and cilantro' },
  edConsomme: { src: asset('/images/editorial/consomme-pour.webp'), alt: 'Birria consommé being poured over tacos' },
  edTable: { src: asset('/images/editorial/table-spread.webp'), alt: 'A table spread of tacos, nachos, bowls and quesadillas for sharing' },
  edCheesePull: { src: asset('/images/editorial/cheese-pull.webp'), alt: 'A hard-shell taco lifted with strings of melted cheese' },
  edSoda: { src: asset('/images/editorial/soda-pour.webp'), alt: 'Lime soda being poured over ice' },
  edShreddedBeef: { src: asset('/images/editorial/shredded-beef.webp'), alt: 'Slow-cooked beef being shredded with two forks' },
}
