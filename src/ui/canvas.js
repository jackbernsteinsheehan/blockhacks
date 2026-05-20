export const W = 320;
export const H = 240;

export function getCtx() {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export function clear(ctx, color = "#000") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

export function strokeRect(ctx, x, y, w, h, color, lw = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.strokeRect((x | 0) + 0.5, (y | 0) + 0.5, (w | 0) - 1, (h | 0) - 1);
}

export function panel(ctx, x, y, w, h, { fill = "#0e1430", border = "#7d8bff" } = {}) {
  rect(ctx, x, y, w, h, fill);
  strokeRect(ctx, x, y, w, h, border, 2);
}

export function text(ctx, str, x, y, { color = "#fff", size = 10, align = "left", baseline = "top" } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${size}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x | 0, y | 0);
}

// Draws a placeholder "sprite" — a colored rounded blob with the member's
// initials. Used until real pixel-art sprites are baked. The blob is
// deterministic per id so each member looks distinct.
export function drawPlaceholderSprite(ctx, id, name, x, y, size = 64) {
  const hue = hashHue(id);
  ctx.save();
  ctx.translate(x, y);
  // body
  rect(ctx, 6, 12, size - 12, size - 18, `hsl(${hue}, 55%, 45%)`);
  // head highlight
  rect(ctx, 10, 6, size - 20, 14, `hsl(${hue}, 65%, 65%)`);
  // shadow under
  rect(ctx, 8, size - 4, size - 16, 3, "rgba(0,0,0,0.45)");
  // initials
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  text(ctx, initials, size / 2, size / 2, {
    color: "#fff",
    size: 14,
    align: "center",
    baseline: "middle",
  });
  ctx.restore();
}

export function drawSprite(ctx, image, x, y, size = 64) {
  ctx.drawImage(image, x | 0, y | 0, size, size);
}

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}
