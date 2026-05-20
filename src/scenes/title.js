import { clear, text, panel, W, H } from "../ui/canvas.js";
import { Menu } from "../ui/menu.js";
import { hasSave, loadGame, clearSave } from "../save.js";
import { Game, rehydrateMon, resetGame, SpeciesById } from "../state.js";
import { IntroScene } from "./intro.js";
import { LadderScene } from "./ladder.js";

export class TitleScene {
  enter() {
    const items = [
      { label: "New Game", action: "new" },
      ...(hasSave() ? [{ label: "Continue", action: "continue" }] : []),
      { label: "Erase Save", action: "erase", danger: true },
    ];
    this.menu = new Menu(items, {
      onConfirm: (it, _i, scenes) => this.handle(it),
    });
    this.t = 0;
  }
  handle(it) {
    if (it.action === "new") {
      resetGame();
      this._scenes.set(new IntroScene());
    } else if (it.action === "continue") {
      const data = loadGame();
      if (!data) return;
      resetGame();
      data.party.forEach((s) => {
        const m = rehydrateMon(s);
        if (m) Game.party.push(m);
      });
      data.pc.forEach((s) => {
        const m = rehydrateMon(s);
        if (m) Game.pc.push(m);
      });
      Game.inventory = { ...Game.inventory, ...data.inventory };
      Game.caught = new Set(data.caught || []);
      Game.ladderProgress = data.ladderProgress | 0;
      this._scenes.set(new LadderScene());
    } else if (it.action === "erase") {
      clearSave();
      this.enter();
    }
  }
  update(dt, scenes) {
    this._scenes = scenes;
    this.t += dt;
    this.menu.update();
  }
  draw(ctx) {
    clear(ctx, "#070a1a");
    // starfield-ish blocks
    for (let i = 0; i < 40; i++) {
      const x = (i * 73 + Math.floor(this.t * 8)) % W;
      const y = (i * 47) % H;
      ctx.fillStyle = i % 4 === 0 ? "#5d6ee0" : "#1a2050";
      ctx.fillRect(x, y, 2, 2);
    }
    text(ctx, "CATCH 'EM ALL", W / 2, 50, { color: "#ffd75e", size: 22, align: "center" });
    text(ctx, "Oregon Blockchain Group", W / 2, 78, { color: "#9d9dff", size: 12, align: "center" });
    text(ctx, "v0.1 — a pixel adventure", W / 2, 96, { color: "#666", size: 9, align: "center" });
    this.menu.draw(ctx, W / 2 - 50, 130, 100, 16);
    text(ctx, "Z confirm   X cancel", W / 2, H - 14, { color: "#555", size: 9, align: "center" });
  }
}
