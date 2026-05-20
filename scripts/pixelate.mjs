// Convert photos in /photos/ to 64x64 pixel-art sprites in /assets/sprites/members/.
// Steps: center-crop to square -> resize 64x64 nearest -> contrast/saturation
// boost -> palette-quantize to 16 colors. Re-running is idempotent.
//
// Usage: cd scripts && npm install && npm run pixelate

import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PHOTOS = path.join(ROOT, "photos");
const OUT = path.join(ROOT, "assets/sprites/members");
const SIZE = 64;
const COLORS = 16;

async function main() {
  if (!existsSync(PHOTOS)) {
    console.error(`No /photos directory found at ${PHOTOS}`);
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(PHOTOS)).filter((f) => /\.(jpe?g|png|webp|gif|tiff?)$/i.test(f));
  if (!files.length) {
    console.log("No photos found in /photos. Drop some in and re-run.");
    return;
  }

  for (const f of files) {
    const inPath = path.join(PHOTOS, f);
    const id = path.basename(f).replace(/\.[^.]+$/, "");
    const outPath = path.join(OUT, `${id}.png`);

    const meta = await sharp(inPath).metadata();
    const s = Math.min(meta.width, meta.height);
    const left = Math.floor((meta.width - s) / 2);
    const top = Math.floor((meta.height - s) / 2);

    await sharp(inPath)
      .extract({ left, top, width: s, height: s })
      .modulate({ saturation: 1.3, brightness: 1.05 })
      .linear(1.15, -8) // contrast boost: out = in*1.15 - 8
      .resize(SIZE, SIZE, { kernel: sharp.kernel.nearest })
      .png({ palette: true, colors: COLORS, dither: 0.8 })
      .toFile(outPath);

    const st = await stat(outPath);
    console.log(`  ${id.padEnd(20)} -> ${outPath}  (${st.size} bytes)`);
  }
  console.log(`\nDone. ${files.length} sprite(s) written to ${OUT}.`);
  console.log(`Make sure each filename (without extension) matches an "id" in src/data/roster.json.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
