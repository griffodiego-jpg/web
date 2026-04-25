/**
 * Genera src/lib/image-dimensions.json con las dimensiones (width, height)
 * de cada imagen rasterizada en /public. Lo consume <AssetImage /> para
 * pasarle width/height a <Image> de next/image sin tener que codificarlas
 * a mano en cada call site.
 *
 * Correr cada vez que se sube/cambia una imagen:
 *   node scripts/gen-image-dimensions.mjs
 */
import sharp from "sharp";
import { readdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";

const PUBLIC_DIR = join(process.cwd(), "public");
const OUT = join(process.cwd(), "src/lib/image-dimensions.json");
const RASTER_RE = /\.(jpe?g|png|webp|avif)$/i;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, acc);
    else if (RASTER_RE.test(name)) acc.push(full);
  }
  return acc;
}

const files = walk(PUBLIC_DIR);
const manifest = {};
for (const file of files) {
  const meta = await sharp(file).metadata();
  if (meta.width && meta.height) {
    const key = "/" + relative(PUBLIC_DIR, file).replace(/\\/g, "/");
    manifest[key] = [meta.width, meta.height];
  }
}

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${Object.keys(manifest).length} entries to ${relative(process.cwd(), OUT)}`);
