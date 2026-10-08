// Turns a green-screen clip into a "stacked alpha" MP4 that any browser can play with
// transparency: the top half of each frame is the colour (premultiplied), the bottom half
// is the alpha matte. src/components/AlphaVideo.tsx recombines the halves in WebGL.
//
//   node scripts/key-video.mjs <input.mp4> <output.mp4> <poster.webp>
//
// Needs ffmpeg on PATH. Everything runs locally.
//
// Keying, per frame:
//   - the backdrop colour B is sampled from the corners
//   - a flood fill starts at the border and spreads through pixels that are either close
//     to B, or lie on the line between B and white (that is, translucent steam over B)
//   - flooded pixels get alpha = how far along that line they are, and become white
//   - everything not reached stays opaque, so greens inside the food survive
//   - the rim of the subject is tightened and de-tinted
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'))
const flagValue = (name) => {
  const hit = flags.find((a) => a.startsWith(name + '='))
  return hit ? hit.slice(name.length + 1) : undefined
}
const [input, output, posterOut, crfArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
if (!input || !output || !posterOut) {
  console.error('usage: node scripts/key-video.mjs <input.mp4> <output.mp4> <poster.webp> [crf] [--shadow] [--shadow-min=0.42] [--no-steam] [--steam-perp=14] [--steam-max=0.7] [--start=N] [--end=N]')
  process.exit(1)
}
const CRF = String(crfArg ?? 25) // lower = sharper and larger. 22 to 28 is the useful range.

// --shadow: the subject stands on the backdrop and casts a shadow on it. Darkened backdrop
// is then kept as a translucent black shadow instead of being left as an opaque dark patch.
const SHADOW = flags.includes('--shadow')
const PERP_SHADOW = 15 // how far a pixel may sit off the backdrop→black line and still count as shadow
// --shadow-min=<0..1>: how dark the backdrop may get and still count as shadow. The default
// reaches almost to black. Raise it (about 0.42) when the subject itself is black, such as a
// black bowl, so the subject is not mistaken for shadow.
const SHADOW_MIN = Number(flagValue('--shadow-min') ?? 0.05)
const SHADOW_MAX_ALPHA = 0.72

const TOL = 40 // RGB distance treated as plain backdrop when reached from the border
const TIGHT = 24 // this close to B is backdrop even when enclosed (gaps between the tacos)
// --steam-perp / --steam-max: how strictly "steam" is recognised. Steam is backdrop mixed with
// white, so it sits almost exactly on the backdrop→white line (small perp). Pale solid things
// such as a beige plate sit further off that line and are brighter, so tightening these two
// numbers (about 14 and 0.7) keeps them solid while faint steam still keys.
const PERP = Number(flagValue('--steam-perp') ?? 30)
const T_MAX = Number(flagValue('--steam-max') ?? 0.82)
const STEAM = [246, 249, 246]
const STEAM_GAIN = 1.25 // steam reads fainter on a light page than on green, so lift it a little
// --no-steam: the clip has no steam. Pale subject colours that sit between the backdrop and
// white (iceberg lettuce on green) are then never treated as translucent steam.
const NO_STEAM = flags.includes('--no-steam')
// --start=<frame> / --end=<frame>: use only part of the clip (frame numbers, end exclusive)
const START = Number(flagValue('--start') ?? 0)
const END = flagValue('--end') === undefined ? undefined : Number(flagValue('--end'))
const PAD = 14
const FPS = 24

const tmp = '.tmp/key-video'
rmSync(tmp, { recursive: true, force: true })
mkdirSync(join(tmp, 'src'), { recursive: true })
mkdirSync(join(tmp, 'out'), { recursive: true })

const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] })

console.log('extracting frames…')
ffmpeg(['-i', input, '-fps_mode', 'passthrough', join(tmp, 'src', '%04d.png')])
const allFrames = readdirSync(join(tmp, 'src')).filter((f) => f.endsWith('.png')).sort()
const frames = allFrames.slice(START, END)
console.log(`${frames.length} frames${frames.length === allFrames.length ? '' : ` (of ${allFrames.length}, from frame ${START})`}`)

/** Returns { W, H, rgb (Uint8Array, straight colour), alpha (Uint8Array) } for one frame. */
async function keyFrame(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width
  const H = info.height
  const N = W * H

  // backdrop colour from the corners
  const patch = 12
  let b0 = 0, b1 = 0, b2 = 0, n = 0
  for (const [cx, cy] of [[0, 0], [W - patch, 0], [0, H - patch], [W - patch, H - patch]]) {
    for (let y = cy; y < cy + patch; y++) {
      for (let x = cx; x < cx + patch; x++) {
        const i = (y * W + x) * 3
        b0 += data[i]; b1 += data[i + 1]; b2 += data[i + 2]; n++
      }
    }
  }
  b0 /= n; b1 /= n; b2 /= n
  const w0 = STEAM[0] - b0, w1 = STEAM[1] - b1, w2 = STEAM[2] - b2
  const wLen2 = w0 * w0 + w1 * w1 + w2 * w2

  const bLen2 = b0 * b0 + b1 * b1 + b2 * b2
  const tArr = new Float32Array(N) // position along backdrop→white
  const sArr = new Float32Array(N) // shadow strength: 0 = backdrop, 1 = black
  // bit 1: passable, bit 2: tight backdrop, bit 4: steam-like, bit 8: shadow-like, bit 16: tight shadow
  const kind = new Uint8Array(N)
  for (let p = 0; p < N; p++) {
    const i = p * 3
    const d0 = data[i] - b0, d1 = data[i + 1] - b1, d2 = data[i + 2] - b2
    const dB = Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2)
    const t = Math.max(0, Math.min(1, (d0 * w0 + d1 * w1 + d2 * w2) / wLen2))
    const p0 = d0 - t * w0, p1 = d1 - t * w1, p2 = d2 - t * w2
    const perp = Math.sqrt(p0 * p0 + p1 * p1 + p2 * p2)
    tArr[p] = t
    const steamLike = !NO_STEAM && perp <= PERP && t <= T_MAX

    let shadowLike = false
    let tightShadow = false
    if (SHADOW) {
      // a shadow is the backdrop scaled towards black: C ≈ scale · B
      const scale = (data[i] * b0 + data[i + 1] * b1 + data[i + 2] * b2) / bLen2
      if (scale < 1 && scale >= SHADOW_MIN) {
        const q0 = data[i] - scale * b0, q1 = data[i + 1] - scale * b1, q2 = data[i + 2] - scale * b2
        const perpS = Math.sqrt(q0 * q0 + q1 * q1 + q2 * q2)
        shadowLike = perpS <= PERP_SHADOW
        tightShadow = perpS <= PERP_SHADOW * 0.6
        if (shadowLike) sArr[p] = 1 - scale
      }
    }

    kind[p] =
      (dB <= TOL || steamLike || shadowLike ? 1 : 0) |
      (dB <= TIGHT ? 2 : 0) |
      (steamLike ? 4 : 0) |
      (shadowLike ? 8 : 0) |
      (tightShadow ? 16 : 0)
  }

  // flood fill from the border through passable pixels
  const flooded = new Uint8Array(N)
  const stack = new Int32Array(N)
  let sp = 0
  const push = (p) => {
    if (!flooded[p] && kind[p] & 1) {
      flooded[p] = 1
      stack[sp++] = p
    }
  }
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x) }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1) }
  while (sp) {
    const p = stack[--sp]
    const x = p % W
    if (x > 0) push(p - 1)
    if (x < W - 1) push(p + 1)
    if (p >= W) push(p - W)
    if (p < N - W) push(p + W)
  }

  const rgb = new Uint8Array(N * 3)
  const alpha = new Uint8Array(N)
  const shadowAlpha = (p) => Math.max(0, Math.min(SHADOW_MAX_ALPHA, (sArr[p] - 0.04) * 1.1))
  for (let p = 0; p < N; p++) {
    const i = p * 3
    if (flooded[p]) {
      const steam = kind[p] & 4 ? Math.max(0, Math.min(1, (tArr[p] - 0.045) * STEAM_GAIN)) : 0
      const shade = kind[p] & 8 ? shadowAlpha(p) : 0
      if (shade > steam) {
        alpha[p] = Math.round(shade * 255) // rgb stays 0,0,0: a black shadow
      } else {
        alpha[p] = Math.round(steam * 255)
        rgb[i] = STEAM[0]; rgb[i + 1] = STEAM[1]; rgb[i + 2] = STEAM[2]
      }
    } else if (kind[p] & 2) {
      alpha[p] = 0 // enclosed patch of backdrop
    } else if (kind[p] & 16) {
      alpha[p] = Math.round(shadowAlpha(p) * 255) // enclosed patch of shadowed backdrop
    } else {
      alpha[p] = 255
      rgb[i] = data[i]; rgb[i + 1] = data[i + 1]; rgb[i + 2] = data[i + 2]
    }
  }

  // tighten and de-tint the rim of the solid subject
  const solid = (p) => alpha[p] === 255 && !flooded[p]
  const cleared = (x, y, r) => {
    for (let dy = -r; dy <= r; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= H) continue
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= W) continue
        const q = yy * W + xx
        if (!solid(q) && alpha[q] < 128) return true
      }
    }
    return false
  }
  const band = new Uint8Array(N)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x
      if (!solid(p)) continue
      if (cleared(x, y, 1)) band[p] = 1
      else if (cleared(x, y, 2)) band[p] = 2
      else if (cleared(x, y, 3)) band[p] = 3
      else if (cleared(x, y, 4)) band[p] = 4
    }
  }
  for (let p = 0; p < N; p++) {
    if (!band[p]) continue
    const i = p * 3
    if (band[p] === 1) alpha[p] = 110
    else if (band[p] === 2) alpha[p] = 225

    if (band[p] === 4) {
      // innermost ring: just take half of the backdrop tint out
      const cap = Math.max(rgb[i], rgb[i + 2])
      if (rgb[i + 1] > cap) rgb[i + 1] = Math.round(cap + (rgb[i + 1] - cap) * 0.5)
      continue
    }

    // The outer three rings are a blend of subject and backdrop. Clamping the tint out would
    // darken them into an outline, so borrow the colour of the nearest clean subject pixel.
    const x = p % W
    const y = (p - x) / W
    let best = -1
    let bestD = Infinity
    for (let dy = -6; dy <= 6; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= H) continue
      for (let dx = -6; dx <= 6; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= W) continue
        const q = yy * W + xx
        if ((band[q] >= 1 && band[q] <= 3) || !solid(q)) continue
        const d = dx * dx + dy * dy
        if (d < bestD) { bestD = d; best = q }
      }
    }
    if (best >= 0) {
      rgb[i] = data[best * 3]; rgb[i + 1] = data[best * 3 + 1]; rgb[i + 2] = data[best * 3 + 2]
    } else {
      const cap = Math.max(rgb[i], rgb[i + 2])
      if (rgb[i + 1] > cap) rgb[i + 1] = cap
    }
  }

  return { W, H, rgb, alpha }
}

// Pass 1: find the crop that contains the subject and steam across the whole clip
console.log('measuring crop…')
let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1, fullW = 0, fullH = 0
for (let f = 0; f < frames.length; f += 4) {
  const { W, H, alpha } = await keyFrame(join(tmp, 'src', frames[f]))
  fullW = W; fullH = H
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (alpha[y * W + x] > 24) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
}
const even = (v) => v - (v % 2)
const cropX = Math.max(0, even(minX - PAD))
const cropY = Math.max(0, even(minY - PAD))
const cropW = even(Math.min(fullW, maxX + PAD) - cropX)
const cropH = even(Math.min(fullH, maxY + PAD) - cropY)
console.log(`crop ${cropW}x${cropH} at ${cropX},${cropY} (source ${fullW}x${fullH})`)

// Pass 2: key every frame and write colour-over-alpha stacked PNGs
console.log('keying…')
for (let f = 0; f < frames.length; f++) {
  const { W, rgb, alpha } = await keyFrame(join(tmp, 'src', frames[f]))
  const stacked = Buffer.alloc(cropW * cropH * 2 * 3)
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const p = (y + cropY) * W + (x + cropX)
      const a = alpha[p]
      const top = (y * cropW + x) * 3
      const bottom = ((y + cropH) * cropW + x) * 3
      // premultiplied colour, so compression never smears backdrop colour into the edge
      stacked[top] = Math.round((rgb[p * 3] * a) / 255)
      stacked[top + 1] = Math.round((rgb[p * 3 + 1] * a) / 255)
      stacked[top + 2] = Math.round((rgb[p * 3 + 2] * a) / 255)
      stacked[bottom] = stacked[bottom + 1] = stacked[bottom + 2] = a
    }
  }
  await sharp(stacked, { raw: { width: cropW, height: cropH * 2, channels: 3 } })
    .png({ compressionLevel: 1 })
    .toFile(join(tmp, 'out', String(f + 1).padStart(4, '0') + '.png'))

  if (f === 0) {
    // poster: the first frame as a real transparent image
    const rgba = Buffer.alloc(cropW * cropH * 4)
    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const p = (y + cropY) * W + (x + cropX)
        const o = (y * cropW + x) * 4
        rgba[o] = rgb[p * 3]; rgba[o + 1] = rgb[p * 3 + 1]; rgba[o + 2] = rgb[p * 3 + 2]; rgba[o + 3] = alpha[p]
      }
    }
    await sharp(rgba, { raw: { width: cropW, height: cropH, channels: 4 } }).webp({ quality: 88, alphaQuality: 100 }).toFile(posterOut)
  }
  if ((f + 1) % 48 === 0) console.log(`  ${f + 1}/${frames.length}`)
}

console.log('encoding…')
ffmpeg([
  '-framerate', String(FPS),
  '-i', join(tmp, 'out', '%04d.png'),
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-movflags', '+faststart', '-an',
  output,
])

rmSync(tmp, { recursive: true, force: true })
console.log(`wrote ${output}: ${cropW}x${cropH * 2} stacked, ${(statSync(output).size / 1024).toFixed(0)} KB`)
console.log(`wrote ${posterOut}: ${cropW}x${cropH}, ${(statSync(posterOut).size / 1024).toFixed(0)} KB`)
