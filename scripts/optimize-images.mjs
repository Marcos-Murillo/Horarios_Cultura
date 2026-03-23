import sharp from "sharp"
import { readdir, stat, rename, writeFile } from "fs/promises"
import { join, extname } from "path"

const DIRS = [
  "public/images/backgrounds",
  "public/images/logos",
]

const CONFIG = {
  backgrounds: { width: 1920, quality: 85 },
  logos: { width: 200, quality: 82 },
}

async function optimizeDir(dir) {
  const type = dir.includes("backgrounds") ? "backgrounds" : "logos"
  const { width, quality } = CONFIG[type]

  const files = await readdir(dir)
  const images = files.filter((f) => /\.(jpg|jpeg|png)$/i.test(f))

  console.log(`\n📁 ${dir} (${images.length} imágenes)`)

  for (const file of images) {
    const input = join(dir, file)
    const tmp = input + ".tmp"
    const before = (await stat(input)).size

    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(tmp)

    // Reemplazar original con el temporal
    await rename(tmp, input)

    const after = (await stat(input)).size
    const saved = (((before - after) / before) * 100).toFixed(0)
    const beforeKB = (before / 1024).toFixed(0)
    const afterKB = (after / 1024).toFixed(0)

    console.log(`  ${file.padEnd(35)} ${beforeKB.padStart(6)} KB → ${afterKB.padStart(5)} KB  (-${saved}%)`)
  }
}

console.log("🎨 Optimizando imágenes...")
for (const dir of DIRS) {
  await optimizeDir(dir)
}
console.log("\n✅ Listo")
