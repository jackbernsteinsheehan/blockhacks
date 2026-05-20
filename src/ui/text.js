import { panel, text, W } from "./canvas.js";

// A typewriter dialogue box. Call update(dt) each frame, draw() to render.
// advance() either speeds up text or moves to next page.
export class TextBox {
  constructor(lines, { onDone = null, cps = 60 } = {}) {
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.page = 0;
    this.shown = 0;
    this.cps = cps;
    this.onDone = onDone;
    this.done = false;
  }
  get currentLine() {
    return this.lines[this.page] ?? "";
  }
  get fullyShown() {
    return this.shown >= this.currentLine.length;
  }
  update(dt) {
    if (this.done) return;
    if (!this.fullyShown) {
      this.shown = Math.min(this.currentLine.length, this.shown + this.cps * dt);
    }
  }
  advance() {
    if (this.done) return;
    if (!this.fullyShown) {
      this.shown = this.currentLine.length;
      return;
    }
    if (this.page < this.lines.length - 1) {
      this.page++;
      this.shown = 0;
    } else {
      this.done = true;
      this.onDone && this.onDone();
    }
  }
  draw(ctx, x = 8, y = 168, w = W - 16, h = 64) {
    panel(ctx, x, y, w, h);
    const visible = this.currentLine.slice(0, Math.floor(this.shown));
    const wrapped = wrapText(visible, Math.floor((w - 16) / 6));
    wrapped.forEach((ln, i) => {
      text(ctx, ln, x + 10, y + 10 + i * 14, { size: 10, color: "#e8e8f0" });
    });
    if (this.fullyShown && !this.done) {
      // blinking arrow
      const blink = (Math.floor(performance.now() / 300) & 1) === 0;
      if (blink) text(ctx, "v", x + w - 14, y + h - 14, { size: 10, color: "#7d8bff" });
    }
  }
}

function wrapText(str, maxChars) {
  const words = str.split(/(\s+)/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + w).length > maxChars && cur.length > 0) {
      lines.push(cur);
      cur = w.trimStart();
    } else {
      cur += w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
