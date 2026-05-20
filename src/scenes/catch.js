import { clear, text, panel, W, H } from "../ui/canvas.js";
import { drawMonSprite } from "../ui/sprites.js";
import { Input } from "../input.js";
import { TextBox } from "../ui/text.js";

export class CatchScene {
  constructor(mon, onDone) {
    this.mon = mon;
    this.onDone = onDone;
  }
  enter() {
    this.box = new TextBox(
      [
        `${this.mon.name} was added to your party!`,
        `${this.mon.species.title}: "${this.mon.species.bio}"`,
        "Press Z to continue.",
      ],
      { onDone: () => this.onDone && this.onDone() }
    );
  }
  update(dt) {
    this.box.update(dt);
    if (Input.wasPressed("confirm")) this.box.advance();
  }
  draw(ctx) {
    clear(ctx, "#0a0e22");
    text(ctx, "NEW DEX ENTRY", W / 2, 12, { size: 11, align: "center", color: "#ffd75e" });
    panel(ctx, W / 2 - 50, 30, 100, 100);
    drawMonSprite(ctx, this.mon.species, W / 2 - 32, 48, 64);
    text(ctx, this.mon.name, W / 2, 120, { size: 10, align: "center", color: "#fff" });
    text(ctx, this.mon.species.types.join(" / "), W / 2, 132, { size: 9, align: "center", color: "#9d9dff" });
    this.box.draw(ctx);
  }
}
