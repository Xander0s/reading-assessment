// Generates icon-192.png and icon-512.png from public/favicon.svg.
// Run with: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svg = await readFile(resolve(root, 'public/favicon.svg'))

for (const size of [192, 512]) {
  const out = resolve(root, `public/icon-${size}.png`)
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toBuffer()
  await writeFile(out, buf)
  console.log(`wrote ${out}`)
}
