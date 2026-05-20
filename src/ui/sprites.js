// Sprite loader. Tries to load /assets/sprites/members/<id>.png for each species.
// If the file doesn't exist, falls back to the procedural placeholder drawing.
//
// Each species gets a stable placeholder index assigned from its position in
// the roster, so no two members ever land on the same placeholder color/shape.

import roster from "../data/roster.js";
import { drawPlaceholderSprite, drawSprite } from "./canvas.js";

const cache = new Map();         // id -> HTMLImageElement | "missing"
const placeholderIndex = new Map(roster.map((s, i) => [s.id, i]));

function load(id) {
  if (cache.has(id)) return;
  const img = new Image();
  img.src = `assets/sprites/members/${id}.png`;
  img.onload = () => { cache.set(id, img); };
  img.onerror = () => { cache.set(id, "missing"); };
  cache.set(id, img); // mark in-flight; onerror will overwrite
}

export function drawMonSprite(ctx, species, x, y, size = 64) {
  load(species.id);
  const entry = cache.get(species.id);
  if (entry && entry !== "missing" && entry.complete && entry.naturalWidth > 0) {
    drawSprite(ctx, entry, x, y, size);
  } else {
    const idx = placeholderIndex.get(species.id) ?? 0;
    drawPlaceholderSprite(ctx, idx, species.name, x, y, size);
  }
}
