import { clear, text, panel, W, H } from "../ui/canvas.js";
import { drawMonSprite } from "../ui/sprites.js";
import { Menu } from "../ui/menu.js";
import { Input } from "../input.js";
import { Game, Ladder, SpeciesById, firstAlive } from "../state.js";
import { BattleScene } from "./battle.js";
import { PartyScene } from "./party.js";
import { PokedexScene } from "./pokedex.js";
import { EndingScene } from "./ending.js";
import { TextBox } from "../ui/text.js";

export class LadderScene {
  enter() {
    this.tab = 0;
    this.buildLadderMenu();
    this.message = null;
  }
  buildLadderMenu() {
    const items = Ladder.map((entry, i) => {
      const sp = SpeciesById.get(entry.id);
      const beaten = i < Game.ladderProgress;
      const locked = i > Game.ladderProgress;
      const tag = beaten ? "[KO]" : locked ? "[--]" : "[!!]";
      return {
        label: `${tag} L${entry.level} ${sp.name} — ${sp.title}`,
        entry,
        i,
        beaten,
        locked,
      };
    });
    this.ladderMenu = new Menu(items, {
      onConfirm: (it) => {
        if (it.locked) {
          this.message = new TextBox("This opponent is locked. Beat the one above first.");
          return;
        }
        if (it.beaten) {
          this.message = new TextBox("You've already beaten this member. Move on.");
          return;
        }
        if (!firstAlive()) {
          this.message = new TextBox("Your party is wiped! Heal up first (rest at the bottom of the screen).");
          return;
        }
        this._scenes.set(new BattleScene(it.entry));
      },
      disabled: (it) => it.locked,
    });
    this.ladderMenu.index = Math.min(Game.ladderProgress, items.length - 1);
  }
  update(dt, scenes) {
    this._scenes = scenes;
    if (this.message) {
      this.message.update(dt);
      if (Input.wasPressed("confirm") || Input.wasPressed("cancel")) {
        this.message.advance();
        if (this.message.done) this.message = null;
      }
      return;
    }
    // tab switcher
    if (Input.wasPressed("left")) this.tab = (this.tab + 2) % 3;
    if (Input.wasPressed("right")) this.tab = (this.tab + 1) % 3;
    if (this.tab === 0) {
      this.ladderMenu.update();
    } else if (Input.wasPressed("confirm")) {
      if (this.tab === 1) this._scenes.set(new PartyScene(() => this._scenes.set(new LadderScene())));
      if (this.tab === 2) this._scenes.set(new PokedexScene(() => this._scenes.set(new LadderScene())));
    }
    // Rest hotkey: press R to fully heal (encourages playing on)
    if (Input.wasPressed("cancel")) {
      for (const m of Game.party) {
        m.hp = m.maxHp;
        m.status = null;
        m.volatile = new Set();
        m.abilityUsed = false;
      }
      this.message = new TextBox("Your party is fully healed.");
    }
    // ending check
    if (Game.ladderProgress >= Ladder.length) {
      this._scenes.set(new EndingScene());
    }
  }
  draw(ctx) {
    clear(ctx, "#0a0e22");
    // Header
    text(ctx, "THE LADDER", 8, 6, { size: 11, color: "#ffd75e" });
    text(ctx, `Caught ${Game.caught.size}/${SpeciesById.size}`, W - 8, 6, { size: 9, color: "#9d9dff", align: "right" });

    // Tabs
    const tabs = ["Ladder", "Party", "Dex"];
    tabs.forEach((t, i) => {
      const x = 8 + i * 50;
      const isSel = i === this.tab;
      panel(ctx, x, 20, 48, 14, { border: isSel ? "#ffd75e" : "#555" });
      text(ctx, t, x + 24, 22, { size: 9, color: isSel ? "#ffd75e" : "#aaa", align: "center" });
    });

    if (this.tab === 0) {
      this.ladderMenu.draw(ctx, 12, 42, W - 24, 11);

      // Side panel: preview selected opponent
      const sel = this.ladderMenu.items[this.ladderMenu.index];
      const sp = SpeciesById.get(sel.entry.id);
      panel(ctx, 8, 170, W - 16, 62);
      drawMonSprite(ctx, sp, 14, 176, 48);
      text(ctx, `${sp.name}  L${sel.entry.level}`, 70, 174, { size: 10, color: "#ffd75e" });
      text(ctx, sp.title, 70, 186, { size: 9, color: "#9d9dff" });
      text(ctx, `Types: ${sp.types.join("/")}`, 70, 198, { size: 9, color: "#fff" });
      text(ctx, sp.bio, 70, 212, { size: 8, color: "#aaa" });
    } else if (this.tab === 1) {
      panel(ctx, 8, 42, W - 16, 120);
      text(ctx, "Z to open party menu", W / 2, 92, { size: 10, color: "#9d9dff", align: "center" });
    } else {
      panel(ctx, 8, 42, W - 16, 120);
      text(ctx, "Z to open Pokédex", W / 2, 92, { size: 10, color: "#9d9dff", align: "center" });
    }

    // Footer hint
    text(ctx, "Arrows: nav    Z: confirm    X: rest (heal)", W / 2, H - 6, { size: 8, color: "#555", align: "center" });
    if (this.message) this.message.draw(ctx);
  }
}
