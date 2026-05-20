// Pokemon-style catch formula. Returns true if caught.
import itemsData from "../data/items.js";
import { rand } from "./rng.js";

export function statusMult(mon) {
  if (!mon.status) return 1.0;
  if (mon.status === "Liquidated") return 2.0;
  if (mon.status === "Slashed") return 1.5;
  if (mon.status === "FUD" || mon.status === "Rugged") return 1.25;
  return 1.0;
}

export function catchChance(mon, ballId) {
  const ball = itemsData[ballId];
  const ballMult = ball?.mult ?? 1.0;
  const catchRate = mon.species.catchRate ?? 100;
  const hpMax = mon.maxHp;
  const hp = mon.hp;
  const sMult = statusMult(mon);
  // Base 0..255 then normalize to 0..1
  const a = ((3 * hpMax - 2 * hp) * catchRate * ballMult * sMult) / (3 * hpMax);
  return Math.min(1, a / 255);
}

export function attemptCatch(mon, ballId) {
  const p = catchChance(mon, ballId);
  // Three rolls — animation flavor
  const rolls = [rand() < Math.cbrt(p), rand() < Math.cbrt(p), rand() < Math.cbrt(p)];
  const caught = rolls.every(Boolean);
  const shakes = rolls.indexOf(false);
  return { caught, shakes: caught ? 3 : shakes };
}
