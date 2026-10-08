// Removes a solid backdrop (green screen or any flat colour) from a product photo and
// writes a trimmed, transparent WebP. Runs locally with sharp. Nothing is uploaded.
//
//   node scripts/cutout-green.mjs <input> <output.webp> [tolerance]
//
// How it works: the backdrop colour is sampled from the image corners, then a flood fill
// starts from every border pixel and only spreads through pixels close to that colour.
// Greens *inside* the subject (cilantro, lime, lettuce) are not connected to the border
// through backdrop-coloured pixels, so they survive. Edges are then feathered and any
// backdrop tint on the rim is neutralised.
import sharp from 'sharp'

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'))
const [input, output, tolArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
if (!input || !output) {
  console.error('usage: node scripts/cutout-green.mjs <input> <output.webp> [tolerance] [--shadow]')
  process.exit(1)
}
const TOLERANCE = Number(tolArg ?? 48) // colour distance treated as backdrop
const SOFT = 26 // extra distance over which the edge fades out

// --shadow: the subject casts a shadow on the backdrop. That darkened backdrop becomes a soft
// translucent shadow instead of staying as an opaque dark fringe.
const SHADOW = flags.includes('--shadow')
const SHADOW_PERP = 16 // how far a pixel may sit off the backdrop→black line
// Only moderately darkened backdrop counts. Anything darker is left alone, so a black or very
// dark subject (a black bowl, burnt edges) is never mistaken for shadow.
const SHADOW_MIN_SCALE = 0.42
const SHADOW_STRENGTH = 0.85

const { data, info } = await sharp(input).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const px = (x, y) => (y * W + x) * 4

// 1. Backdrop colour: average of a small patch in each corner
const patch = Math.max(4, Math.round(Math.min(W, H) * 0.02))
let br = 0, bg = 0, bb = 0, n = 0
for (const [cx, cy] of [[0, 0], [W - patch, 0], [0, H - patch], [W - patch, H - patch]]) {
  for (let y = cy; y < cy + patch; y++) {
    for (let x = cx; x < cx + patch; x++) {
      const i = px(x, y)
      br += data[i]; bg += data[i + 1]; bb += data[i + 2]; n++
    }
  }
}
br /= n; bg /= n; bb /= n

const dist = (i) => Math.hypot(data[i] - br, data[i + 1] - bg, data[i + 2] - bb)

// How strongly a pixel is "backdrop in shadow": 0 = not shadow, otherwise 0..1 darkness.
const bLen2 = br * br + bg * bg + bb * bb
const shadowAmount = (i) => {
  if (!SHADOW) return 0
  const scale = (data[i] * br + data[i + 1] * bg + data[i + 2] * bb) / bLen2
  if (scale >= 1 || scale < SHADOW_MIN_SCALE) return 0
  const perp = Math.hypot(data[i] - scale * br, data[i + 1] - scale * bg, data[i + 2] - scale * bb)
  return perp <= SHADOW_PERP ? 1 - scale : 0
}

// 2. Flood fill from the border through backdrop-coloured (or shadowed backdrop) pixels
const isBackdrop = new Uint8Array(W * H)
const stack = []
const tryPush = (x, y) => {
  const p = y * W + x
  if (isBackdrop[p]) return
  if (dist(p * 4) <= TOLERANCE + SOFT || shadowAmount(p * 4) > 0) {
    isBackdrop[p] = 1
    stack.push(p)
  }
}
for (let x = 0; x < W; x++) { tryPush(x, 0); tryPush(x, H - 1) }
for (let y = 0; y < H; y++) { tryPush(0, y); tryPush(W - 1, y) }
while (stack.length) {
  const p = stack.pop()
  const x = p % W
  const y = (p - x) / W
  if (x > 0) tryPush(x - 1, y)
  if (x < W - 1) tryPush(x + 1, y)
  if (y > 0) tryPush(x, y - 1)
  if (y < H - 1) tryPush(x, y + 1)
}

// 3. Alpha: fully clear inside the tolerance, fading out across the soft band
let removed = 0
for (let p = 0; p < W * H; p++) {
  if (!isBackdrop[p]) continue
  const i = p * 4
  const d = dist(i)
  const shade = d > TOLERANCE ? shadowAmount(i) : 0
  let a
  if (shade > 0) {
    // shadowed backdrop: keep it as translucent black, strength following how dark it was
    a = Math.round(Math.min(0.6, Math.max(0, shade - 0.06) * SHADOW_STRENGTH) * 255)
    data[i] = data[i + 1] = data[i + 2] = 0
  } else {
    a = d <= TOLERANCE ? 0 : Math.round(((d - TOLERANCE) / SOFT) * 255)
  }
  data[i + 3] = Math.min(data[i + 3], a)
  if (a === 0) removed++
}

// 4. Tighten the edge: the outermost ring of subject pixels is a blend of subject and
//    backdrop, so pull it in. Distance to the nearest fully clear pixel decides how much.
const alpha0 = new Uint8Array(W * H)
for (let p = 0; p < W * H; p++) alpha0[p] = data[p * 4 + 3]
const clearWithin = (x, y, r) => {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx, yy = y + dy
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue
      if (alpha0[yy * W + xx] === 0) return true
    }
  }
  return false
}
const edgeBand = new Uint8Array(W * H) // 1 = touching the cut, 2 = within two pixels, 3 = within four
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = y * W + x
    if (alpha0[p] === 0) continue
    if (clearWithin(x, y, 1)) edgeBand[p] = 1
    else if (clearWithin(x, y, 2)) edgeBand[p] = 2
    else if (clearWithin(x, y, 4)) edgeBand[p] = 3
    if (edgeBand[p] === 1) data[p * 4 + 3] = Math.round(alpha0[p] * 0.3)
    else if (edgeBand[p] === 2) data[p * 4 + 3] = Math.round(alpha0[p] * 0.85)
  }
}

// 5. Despill: remove the backdrop tint from that same band, fully at the rim, partly inside
const dominant = bg >= br && bg >= bb ? 1 : br >= bb ? 0 : 2 // channel the backdrop is strongest in
const others = [0, 1, 2].filter((c) => c !== dominant)
for (let p = 0; p < W * H; p++) {
  if (!edgeBand[p]) continue
  const i = p * 4
  const cap = Math.max(data[i + others[0]], data[i + others[1]])
  if (data[i + dominant] <= cap) continue
  const keep = edgeBand[p] === 3 ? 0.5 : 0 // how much of the original tint survives
  data[i + dominant] = Math.round(cap + (data[i + dominant] - cap) * keep)
}

// 6. Trim the empty margin, cap the size, write WebP with alpha
const cut = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
const result = await sharp(cut)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
  .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(output)

console.log(
  `backdrop rgb(${Math.round(br)}, ${Math.round(bg)}, ${Math.round(bb)}), removed ${((removed / (W * H)) * 100).toFixed(1)}% of pixels`,
)
console.log(`wrote ${output}: ${result.width}x${result.height}, ${(result.size / 1024).toFixed(0)} KB`)
