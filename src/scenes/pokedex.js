import { clear, text, panel, W, H } from "../ui/canvas.js";
import { drawMonSprite } from "../ui/sprites.js";
import { Menu } from "../ui/menu.js";
import { Input } from "../input.js";
import { Game, Roster, SpeciesById } from "../state.js";

export class PokedexScene {
  constructor(onBack) { this.onBack = onBack; }
  enter() {
    const items = Roster.map((sp, i) => ({
      label: Game.caught.has(sp.id) ? `${String(i + 1).padStart(2, "0")} ${sp.name}` : `${String(i + 1).padStart(2, "0")} ???`,
      species: sp,
      caught: Game.caught.has(sp.id),
    }));
    this.menu = new Menu(items, {
      onCancel: () => this.onBack && this.onBack(),
      onConfirm: () => {},
    });
  }
  update() {
    this.menu.update();
    if (Input.wasPressed("cancel")) this.onBack && this.onBack();
  }
  draw(ctx) {
    clear(ctx, "#0a0e22");
    text(ctx, "DEX", W / 2, 8, { size: 11, color: "#ffd75e", align: "center" });
    this.menu.draw(ctx, 8, 28, 140, 10);

    const sel = this.menu.items[this.menu.index];
    if (sel) {
      panel(ctx, 156, 24, W - 164, H - 32);
      if (sel.caught) {
        drawMonSprite(ctx, sel.species, 160, 28, 64);
        text(ctx, sel.species.name, 160, 96, { size: 10, color: "#fff" });
        text(ctx, sel.species.title, 160, 108, { size: 9, color: "#9d9dff" });
        text(ctx, sel.species.types.join(" / "), 160, 120, { size: 9, color: "#ffd75e" });
        text(ctx, "Bio:", 160, 138, { size: 8, color: "#ffd75e" });
        // Wrap bio
        const bio = sel.species.bio || "";
        wrap(bio, 22).forEach((ln, i) => text(ctx, ln, 160, 150 + i * 9, { size: 8, color: "#e8e8f0" }));
      } else {
        text(ctx, "???", W - (W - 156) / 2 - 8, 80, { size: 16, color: "#444", align: "center" });
        text(ctx, "Catch them to fill", 160, 130, { size: 9, color: "#888" });
        text(ctx, "this dex entry.", 160, 142, { size: 9, color: "#888" });
      }
    }
    text(ctx, `Caught ${Game.caught.size}/${Roster.length}`, 8, H - 10, { size: 8, color: "#9d9dff" });
    text(ctx, "X: back", W - 8, H - 10, { size: 8, color: "#666", align: "right" });
  }
}

function wrap(s, n) {
  const out = [];
  const words = s.split(/\s+/);
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).length > n) { out.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) out.push(cur);
  return out;
}
