# Super Rico — Mexican Fusion, Made Local

A single-page restaurant site for Super Rico, Gading Serpong. It opens with a cinematic
scroll-snap hero of four signature dishes, then flows into a full page: menu, about, gallery,
Google reviews, reservations, find us, FAQ and footer.

Built with React 19 + Vite, TypeScript, Tailwind CSS v3, Framer Motion, lucide-react and
react-intersection-observer.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Sources used (captured 2 October 2026)

| Source                          | Used for                                                                 |
| ------------------------------- | ------------------------------------------------------------------------ |
| Instagram @superrico.id         | Tagline, hours, address, 12 post photos, profile logo, event poster      |
| Google Maps listing             | Rating 4.7 / 231 reviews, rating breakdown, "mentioned most" keywords, 10 reviews, menu categories and popular items, About amenities, 20+ listing and review photos |
| Google Maps About tab           | Dine-in / takeaway, casual-cosy-trendy, groups, debit cards, free parking |
| Reviews                         | No pork no lard, two floors, free-refill iced tea, price range            |

Photos live in `public/images/ig/` (Instagram) and `public/images/gmaps/` (Google Maps).
Each photo carries a credit label in the gallery. Originals are kept in `originals/` and are not shipped. Review photos belong to the reviewers who
posted them; the restaurant should confirm it is comfortable using them before launch.

## Page structure

| Section      | Anchor      | Notes                                                                 |
| ------------ | ----------- | --------------------------------------------------------------------- |
| Dish worlds  | `#tacos` …  | Four 100dvh snap sections: tacos, burrito, bowl, nachos. Real photos in a tilting card |
| Marquee      |             | Scrolling ticker, words in `marqueeWords`                             |
| Menu         | `#menu`     | Six category tabs from the Google menu, photo per category            |
| About        | `#about`    | Story, amenities checklist, kitchen and storefront photos, value cards, upcoming event |
| Gallery      | `#gallery`  | Ten real photos with captions and source credit                       |
| Reviews      | `#reviews`  | Google rating, breakdown bars, top keywords, 10 review cards, link to Google |
| Reservations | `#reserve`  | Validated form, WhatsApp hand-off, copyable fallback                  |
| Find Us      | `#find-us`  | Address, hours, delivery, Instagram, embedded Google Map              |
| FAQ          | `#faq`      | Accordion with facts from the listing and reviews                     |
| Footer       |             | Links, order links, address, hours                                    |

## Reservations: how it works

The form collects name, WhatsApp number, date, time slot, guest count and notes. Slots run
every 30 minutes from `brand.firstSeating` to `brand.lastSeating`. On submit:

1. Fields are validated in the browser (name, phone, date not in the past, 1 to `maxGuests`).
2. The request is kept in `localStorage` so a refresh still shows the confirmation.
3. If `brand.whatsapp` is set, a WhatsApp chat opens with the message pre-filled.
4. If `brand.whatsapp` is empty, the confirmation shows the composed message with a
   "Copy message" button and a link to DM on Instagram.

**To go live, set `whatsapp` in `src/data/sections.ts`** to the restaurant's number in
international format without the plus sign, for example `628123456789`.

## Where things live

```
src/
  App.tsx                          background layer, theme state, section order, deep-link scroll
  components/Navbar.tsx            fixed navbar, Reserve button, mobile drawer
  components/DishSection.tsx       cinematic dish world (hero) with photo card
  components/PageSection.tsx       wrapper for flowing sections + shared heading + reveal preset
  components/Marquee.tsx
  components/MenuSection.tsx
  components/AboutSection.tsx
  components/GallerySection.tsx
  components/ReviewsSection.tsx
  components/ReservationSection.tsx
  components/FindUsSection.tsx
  components/FaqSection.tsx
  components/Footer.tsx
  components/Particles.tsx
  components/icons.tsx             Instagram and WhatsApp glyphs
  data/sections.ts                 brand facts, links, amenities, event, dish copy, photo index
  data/menu.ts                     menu categories, items, FAQ entries
  data/reviews.ts                  Google rating summary and review texts
  types.ts
public/images/ig/                  Instagram photos (ig-01 … ig-12, profile.jpg)
public/images/gmaps/               Google Maps listing, menu and review photos
```

## Before launch

- **Image weight.** Photos are stored as downloaded JPEGs (roughly 300–600 KB each, one at
  1.6 MB). Convert to WebP and resize to about 1200px wide before going live.
- **Menu items** come from the Google menu tab, the menu board photo and reviews. Prices are
  omitted on purpose. Confirm names with the restaurant.
- **GoFood / GrabFood links** point to the app home pages. Replace `brand.gofood` and
  `brand.grabfood` with the restaurant's store links.
- **WhatsApp number** for reservations: see above.
- **Reviews** are a snapshot. Refresh them from Google periodically, or swap in the Google
  Places API if you want them live.
- **Instagram photo links expire**, which is why the files are copied into the project rather
  than hotlinked. Replace with originals from the restaurant for best quality.

## Interaction and accessibility notes

- **Navbar** is transparent over the dish worlds and becomes a translucent blurred layer with a
  soft edge fade once content scrolls under it. A progress bar and the highlighted link show
  where you are on the page.
- **Motion** uses critically damped springs (`SPRING` in `PageSection.tsx`). Hero entrances play
  once and settle in about half a second.
- **Press feedback**: add the `press` class to any tappable control, plus `press-lift` for a
  hover lift on pointer devices. FAQ rows use `press-row`.
- **Reduced motion** is honoured through `MotionConfig reducedMotion="user"` in `App.tsx`:
  slides become cross-fades, the 3D tilt, floating card and particles switch off.
- **Reduced transparency** and **increased contrast** turn the navbar and glass cards solid and
  bring softened text to full strength (see the media queries at the end of `index.css`).
- **Overlays** (mobile drawer, photo lightbox) share `hooks/useModal.ts`: Escape closes, Tab is
  trapped, scroll is locked, and focus returns to the opener.
- **Reservation form** validates each field as you leave it and offers Undo for eight seconds
  after "New request".

## Images

`npm i` then `node scripts/optimize-images.mjs` converts any JPEG dropped into
`public/images/gmaps` or `public/images/ig` to WebP at 1200px wide, and moves the original to
`originals/`. Shipped photos total about 3.8 MB, down from 11.8 MB.

### Floating dish cutouts

A hero world can show its dish as a transparent cutout instead of a framed photo. Shoot or
supply the dish on a flat backdrop, then:

```bash
node scripts/cutout-green.mjs originals/hero/taco-green.png public/images/hero/tacos.webp
```

The script samples the backdrop colour from the corners, removes only backdrop pixels connected
to the image border (so greens inside the food survive), tightens and de-tints the edge, trims
the margin and writes a WebP with transparency. Add `--shadow` when the dish casts a shadow on the backdrop (the bowl): the darkened backdrop becomes a soft translucent shadow, while anything very dark, such as a black bowl, is left alone. Then set `image` to the new file and add
`cutout: true` on that entry in `src/data/sections.ts`. The bowl world uses this now.

### Floating dish video

A hero world can play a transparent clip instead of a still. Supply a clip of the dish on a
flat backdrop, then (ffmpeg required):

```bash
node scripts/key-video.mjs originals/hero/tacos-rotation-2.mp4 public/videos/tacos.mp4 public/images/hero/tacos-video-poster.webp
```

The script keys every frame (steam becomes real translucency, greens inside the food are
kept), crops to the subject, and writes a "stacked alpha" H.264 MP4: colour on top, the alpha
matte underneath. Browsers disagree on transparent video formats, so
`src/components/AlphaVideo.tsx` recombines the two halves on a WebGL canvas, which works in
every browser including iOS Safari. It also writes the first frame as a transparent poster.

Then set `video`, `videoPoster` and `videoAspect` on the entry in `src/data/sections.ts`.
Remove those three lines to go back to the still image. The clip only plays while its world
is on screen, pauses for reduced-motion users (the poster shows instead), and fades briefly at
the loop point so a clip that does not loop seamlessly never visibly jumps.

**Dishes that stand on a surface.** If the clip shows the dish sitting on the backdrop, with a
shadow, or cut off by the bottom of the frame (the burrito), key it with `--shadow` and anchor
it:

```bash
node scripts/key-video.mjs originals/hero/burrito-rotation.mp4 public/videos/burrito.mp4 public/images/hero/burrito-video-poster.webp 25 --shadow
```

`--shadow` turns the darkened backdrop under the dish into a real translucent shadow. In
`sections.ts`, `videoAnchor: 'bottom'` stands the clip on the bottom edge of its world so the
cut-off is never visible (no float or tilt in that mode), and `videoLoopFade: 0` removes the
loop fade for clips that rotate a full 360°.

**Photos cropped by their own frame.** If a cutout photo runs off the right and bottom edges of
the picture (the nachos plate), floating it would expose two straight cuts. Add
`imageAnchor: 'bottom-right'` to that entry: the dish is pinned to the bottom-right corner of its
world, where both cuts sit on the screen edges, and the copy moves to the left. A photo or clip
with the whole dish in frame can drop that line and float instead.

**Keying options, by clip.** The four hero clips needed different settings; the useful ones:

| Option | Use it when | Used for |
| --- | --- | --- |
| `--shadow` | the dish casts a shadow on the backdrop | burrito, bowl, nachos |
| `--shadow-min=0.42` | the dish itself is black (a black bowl would otherwise count as shadow) | bowl |
| `--no-steam` | there is no steam, and pale greens such as lettuce touch the backdrop | bowl |
| `--steam-perp=14 --steam-max=0.7` | there is faint steam *and* a pale plate; keeps the plate solid while steam still keys | nachos |
| `--start=48` | skip an opening that is cut off by the frame | bowl |

Always check a few recombined frames on the world's colour and on near-black before shipping.

## Editorial images (generated)

The menu, about, gallery and reviews sections use a set of fourteen editorial food images
generated with the Higgsfield connector (model `gpt_image_2_5`, about 0.25 credits each) from
one shared style brief: dark charcoal and terracotta surfaces, warm side light, shallow depth
of field. They live in `public/images/editorial/` (WebP, 1200px) with the PNG originals in
`originals/editorial/`, and are indexed as the `ed*` entries of `photos` in `src/data/sections.ts`.

They are AI-generated, not photographs of Super Rico's own dishes, so they carry no source
credit in the gallery. Photos of the real place (dining room, storefront, member club card,
event poster) are kept where authenticity matters. Replace any editorial image with a real
shoot later by overwriting the file; the layout does not change.

## Deployment

The site is deployed with GitHub Pages from the public repository
[firlyfitrahardi-hue/superrico](https://github.com/firlyfitrahardi-hue/superrico):

**https://firlyfitrahardi-hue.github.io/superrico/**

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes
`dist/`. Nothing else is needed to redeploy. The build uses relative asset URLs (`base: './'`
in `vite.config.ts` and the `asset()` helper in `src/data/asset.ts`) so it works under the
`/superrico/` sub-path. Source media in `originals/` is not committed; the processed files in
`public/` are.

To use a custom domain later, add a `CNAME` file to `public/` with the domain and point the
domain's DNS at GitHub Pages; the relative URLs need no change.
