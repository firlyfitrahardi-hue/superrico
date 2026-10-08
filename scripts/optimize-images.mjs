// Converts the downloaded JPEGs in public/images/{gmaps,ig} to resized WebP,
// and moves the originals to ./originals so they are not shipped.
import { mkdirSync, readdirSync, renameSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const MAX_WIDTH = 1200
const QUALITY = 76
let before = 0
let after = 0

for (const dir of ['gmaps', 'ig']) {
  const src = join('public/images', dir)
  const keep = join('originals', dir)
  mkdirSync(keep, { recursive: true })
  for (const file of readdirSync(src).filter((f) => f.endsWith('.jpg'))) {
    const input = join(src, file)
    const output = join(src, file.replace(/\.jpg$/, '.webp'))
    await sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(output)
    before += statSync(input).size
    after += statSync(output).size
    renameSync(input, join(keep, file))
  }
}

// Small logo for the navbar, footer and favicon (the 1024px master stays as logo.png)
await sharp('public/images/brand/logo.png').resize({ width: 256 }).png({ compressionLevel: 9 }).toFile('public/images/brand/logo-256.png')

console.log(`photos: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`)
console.log(`logo-256.png: ${(statSync('public/images/brand/logo-256.png').size / 1024).toFixed(0)} KB`)
