import { clear, text, panel, W, H } from "../ui/canvas.js";
import { TextBox } from "../ui/text.js";
import { Input } from "../input.js";
import { Game } from "../state.js";
import { TitleScene } from "./title.js";

export class EndingScene {
  enter() {
    this.t = 0;
    this.box = new TextBox(
      [
        "The crowd of the Oregon Blockchain Group goes wild.",
        "You've defeated every gym member and outmaneuvered the President.",
        "You are the new President of the Oregon Blockchain Group.",
        `You caught ${Game.caught.size} members along the way.`,
        "Long live the chain.",
      ],
      { onDone: () => this._scenes.set(new TitleScene()) }
    );
  }
  update(dt, scenes) {
    this._scenes = scenes;
    this.t += dt;
    this.box.update(dt);
    if (Input.wasPressed("confirm")) this.box.advance();
  }
  draw(ctx) {
    clear(ctx, "#02030a");
    // gradient-ish bands
    for (let y = 0; y < H; y++) {
      const k = Math.floor(8 + 20 * Math.sin((y + this.t * 30) * 0.05));
      ctx.fillStyle = `rgb(${k}, ${k * 1.4 | 0}, ${k * 2 | 0})`;
      ctx.fillRect(0, y, W, 1);
    }
    text(ctx, "PRESIDENT", W / 2, 60, { size: 28, color: "#ffd75e", align: "center" });
    text(ctx, "of the Oregon Blockchain Group", W / 2, 92, { size: 10, color: "#9d9dff", align: "center" });
    this.box.draw(ctx);
  }
}
