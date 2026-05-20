const keymap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  KeyZ: "confirm",
  Enter: "confirm",
  Space: "confirm",
  KeyX: "cancel",
  Escape: "cancel",
  ShiftLeft: "run",
};

const state = {
  down: new Set(),
  pressed: new Set(),
  released: new Set(),
};

window.addEventListener("keydown", (e) => {
  const k = keymap[e.code];
  if (!k) return;
  e.preventDefault();
  if (!state.down.has(k)) state.pressed.add(k);
  state.down.add(k);
});

window.addEventListener("keyup", (e) => {
  const k = keymap[e.code];
  if (!k) return;
  e.preventDefault();
  state.down.delete(k);
  state.released.add(k);
});

window.addEventListener("blur", () => {
  state.down.clear();
});

export const Input = {
  isDown: (k) => state.down.has(k),
  wasPressed: (k) => state.pressed.has(k),
  wasReleased: (k) => state.released.has(k),
  endFrame() {
    state.pressed.clear();
    state.released.clear();
  },
};
