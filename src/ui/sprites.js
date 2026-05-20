// Sprite loader. Tries to load /assets/sprites/members/<id>.png for each species.
// If the file doesn't exist, falls back to the procedural placeholder drawing.

import { drawPlaceholderSprite, drawSprite } from "./canvas.js";

const cache = new Map();         // id -> HTMLImageElement | "missing"

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
    drawPlaceholderSprite(ctx, species.id, species.name, x, y, size);
  }
}
