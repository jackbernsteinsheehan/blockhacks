import { clear, text, panel, W, H } from "../ui/canvas.js";
import { drawMonSprite } from "../ui/sprites.js";
import { TextBox } from "../ui/text.js";
import { Menu } from "../ui/menu.js";
import { Input } from "../input.js";
import { Game, SpeciesById, addToParty } from "../state.js";
import { makeMon } from "../systems/battle_engine.js";
import { LadderScene } from "./ladder.js";
import { saveGame } from "../save.js";

const STARTER_IDS = ["intern_a", "intern_b", "intern_c"];

export class IntroScene {
  enter() {
    this.phase = "dialogue";
    this.box = new TextBox([
      "Welcome to the Oregon Blockchain Group club fair!",
      "I'm the club's outgoing President. I've battled every member here.",
      "You want my job? You'll have to catch them all and beat me.",
      "But first — pick a starter. Choose your founding member.",
    ], { onDone: () => { this.phase = "pick"; this.buildMenu(); } });
    this.selected = 0;
  }
  buildMenu() {
    this.menu = new Menu(
      STARTER_IDS.map((id) => ({ label: SpeciesById.get(id).name, id })),
      {
        onConfirm: (it) => {
          this.selected = STARTER_IDS.indexOf(it.id);
          this.confirmBox = new TextBox(
            [`You picked ${SpeciesById.get(it.id).name}!`, "Climb the ladder. Beat the President. Become legend."],
            { onDone: () => this.finish() }
          );
          this.phase = "confirm";
        },
      }
    );
  }
  finish() {
    const id = STARTER_IDS[this.selected];
    const species = SpeciesById.get(id);
    const mon = makeMon(species, 5);
    addToParty(mon);
    saveGame(Game);
    this._scenes.set(new LadderScene());
  }
  update(dt, scenes) {
    this._scenes = scenes;
    if (this.phase === "dialogue") {
      this.box.update(dt);
      if (Input.wasPressed("confirm")) this.box.advance();
    } else if (this.phase === "pick") {
      this.menu.update();
      // arrow keys move highlight even before confirm — track for preview
      this.selected = this.menu.index;
    } else if (this.phase === "confirm") {
      this.confirmBox.update(dt);
      if (Input.wasPressed("confirm")) this.confirmBox.advance();
    }
  }
  draw(ctx) {
    clear(ctx, "#101428");
    text(ctx, "Choose your founding member", W / 2, 12, { color: "#ffd75e", size: 11, align: "center" });

    // Three starter portraits
    STARTER_IDS.forEach((id, i) => {
      const sp = SpeciesById.get(id);
      const x = 40 + i * 90;
      const y = 36;
      const isSel = this.phase === "pick" && this.selected === i;
      panel(ctx, x - 6, y - 6, 76, 92, { border: isSel ? "#ffd75e" : "#7d8bff" });
      drawMonSprite(ctx, sp, x, y, 64);
      text(ctx, sp.name, x + 32, y + 70, { size: 9, color: "#fff", align: "center" });
      text(ctx, sp.types.join("/"), x + 32, y + 82, { size: 8, color: "#9d9dff", align: "center" });
    });

    if (this.phase === "dialogue") this.box.draw(ctx);
    else if (this.phase === "confirm") this.confirmBox.draw(ctx);
    else if (this.phase === "pick") {
      panel(ctx, 8, 168, W - 16, 64);
      const sp = SpeciesById.get(STARTER_IDS[this.selected]);
      text(ctx, `${sp.name} — ${sp.title}`, 16, 176, { size: 10, color: "#ffd75e" });
      text(ctx, sp.bio, 16, 192, { size: 9, color: "#e8e8f0" });
      text(ctx, `Types: ${sp.types.join(", ")}`, 16, 210, { size: 9, color: "#9d9dff" });
      text(ctx, "Z: choose", W - 60, 220, { size: 8, color: "#888" });
    }
  }
}
