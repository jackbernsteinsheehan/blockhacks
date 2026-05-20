import { Input } from "./input.js";
import { getCtx } from "./ui/canvas.js";
import { TitleScene } from "./scenes/title.js";

const ctx = getCtx();

class SceneManager {
  constructor() {
    this.scene = null;
    this.next = null;
  }
  set(scene) {
    this.next = scene;
  }
  update(dt) {
    if (this.next) {
      this.scene && this.scene.exit && this.scene.exit();
      this.scene = this.next;
      this.next = null;
      this.scene.enter && this.scene.enter(this);
    }
    this.scene && this.scene.update(dt, this);
  }
  draw(ctx) {
    this.scene && this.scene.draw(ctx);
  }
}

export const Scenes = new SceneManager();
Scenes.set(new TitleScene());

let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  Scenes.update(dt);
  Scenes.draw(ctx);
  Input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
