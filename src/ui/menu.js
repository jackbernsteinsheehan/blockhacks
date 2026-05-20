import { Input } from "../input.js";
import { panel, text } from "./canvas.js";

export class Menu {
  constructor(items, { columns = 1, onConfirm = null, onCancel = null, disabled = () => false } = {}) {
    this.items = items;
    this.columns = columns;
    this.index = 0;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.disabled = disabled;
  }
  get rows() {
    return Math.ceil(this.items.length / this.columns);
  }
  move(dx, dy) {
    const cols = this.columns;
    const rows = this.rows;
    let c = this.index % cols;
    let r = Math.floor(this.index / cols);
    c = (c + dx + cols) % cols;
    r = (r + dy + rows) % rows;
    const next = Math.min(this.items.length - 1, r * cols + c);
    this.index = next;
  }
  update() {
    if (Input.wasPressed("up")) this.move(0, -1);
    if (Input.wasPressed("down")) this.move(0, 1);
    if (Input.wasPressed("left")) this.move(-1, 0);
    if (Input.wasPressed("right")) this.move(1, 0);
    if (Input.wasPressed("confirm")) {
      const item = this.items[this.index];
      if (!this.disabled(item, this.index)) this.onConfirm && this.onConfirm(item, this.index);
    }
    if (Input.wasPressed("cancel")) this.onCancel && this.onCancel();
  }
  draw(ctx, x, y, cellW, cellH, { fill = "#0e1430", border = "#7d8bff" } = {}) {
    panel(ctx, x - 4, y - 4, cellW * this.columns + 8, cellH * this.rows + 8, { fill, border });
    this.items.forEach((it, i) => {
      const c = i % this.columns;
      const r = Math.floor(i / this.columns);
      const px = x + c * cellW;
      const py = y + r * cellH;
      const isSel = i === this.index;
      const isDisabled = this.disabled(it, i);
      const label = typeof it === "string" ? it : it.label;
      if (isSel) text(ctx, ">", px - 4, py + 2, { size: 10, color: "#ffd75e" });
      text(ctx, label, px + 8, py + 2, {
        size: 10,
        color: isDisabled ? "#555" : isSel ? "#ffd75e" : "#e8e8f0",
      });
    });
  }
}
