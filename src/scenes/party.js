import { clear, text, panel, W, H } from "../ui/canvas.js";
import { drawMonSprite } from "../ui/sprites.js";
import { Menu } from "../ui/menu.js";
import { Input } from "../input.js";
import { Game } from "../state.js";
import { STATUSES } from "../systems/statuses.js";

export class PartyScene {
  constructor(onBack) { this.onBack = onBack; }
  enter() {
    const items = Game.party.map((m, i) => ({
      label: `${m.name} L${m.level} HP ${m.hp}/${m.maxHp}`,
      mon: m,
      i,
    }));
    if (!items.length) items.push({ label: "(empty)", disabled: true });
    this.menu = new Menu(items, {
      onCancel: () => this.onBack && this.onBack(),
      onConfirm: () => {},
      disabled: (it) => it.disabled,
    });
  }
  update(dt) {
    this.menu.update();
    if (Input.wasPressed("cancel")) this.onBack && this.onBack();
  }
  draw(ctx) {
    clear(ctx, "#0a0e22");
    text(ctx, "PARTY", W / 2, 8, { size: 11, color: "#ffd75e", align: "center" });
    this.menu.draw(ctx, 8, 28, 180, 14);

    const sel = this.menu.items[this.menu.index];
    if (sel?.mon) {
      const m = sel.mon;
      panel(ctx, 196, 24, W - 204, H - 32);
      drawMonSprite(ctx, m.species, 200, 28, 48);
      text(ctx, m.name, 200, 80, { size: 10, color: "#fff" });
      text(ctx, m.species.title, 200, 92, { size: 8, color: "#9d9dff" });
      text(ctx, `L ${m.level}`, 200, 104, { size: 9, color: "#ffd75e" });
      const s = m.stats;
      text(ctx, `ATK ${s.atk}`, 200, 116, { size: 8, color: "#fff" });
      text(ctx, `DEF ${s.def}`, 200, 126, { size: 8, color: "#fff" });
      text(ctx, `SPA ${s.spa}`, 200, 136, { size: 8, color: "#fff" });
      text(ctx, `SPD ${s.spd}`, 200, 146, { size: 8, color: "#fff" });
      text(ctx, `SPE ${s.spe}`, 200, 156, { size: 8, color: "#fff" });
      if (m.status) {
        const ss = STATUSES[m.status];
        text(ctx, ss.label, 200, 170, { size: 9, color: ss.color });
      }
      text(ctx, "Moves:", 200, 184, { size: 8, color: "#ffd75e" });
      m.moves.forEach((mv, i) => text(ctx, "- " + mv, 200, 196 + i * 9, { size: 8, color: "#e8e8f0" }));
    }
    text(ctx, "X: back", W - 8, H - 10, { size: 8, color: "#666", align: "right" });
  }
}
