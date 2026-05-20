// Mulberry32 — small, fast, seedable RNG.
let state = (Date.now() ^ 0xdeadbeef) >>> 0;

export function seed(s) {
  state = (s >>> 0) || 1;
}

export function rand() {
  state |= 0;
  state = (state + 0x6D2B79F5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
export const chance = (pct) => rand() * 100 < pct;
export const pick = (arr) => arr[Math.floor(rand() * arr.length)];
