// Persistent and volatile status effects.
// Persistent: Slashed (damage over time), Liquidated (skip-turn chance), FUD (lowered accuracy).
// Volatile: Flinched (lose next turn once), Forked (one-time half damage).

import { chance } from "./rng.js";

export const STATUSES = {
  Slashed: { kind: "persistent", label: "SLSH", color: "#b03030" },
  Liquidated: { kind: "persistent", label: "LIQD", color: "#e6c84a" },
  FUD: { kind: "persistent", label: "FUD", color: "#9e5cc0" },
  Rugged: { kind: "persistent", label: "RUGD", color: "#7a5238" },
  Forked: { kind: "volatile", label: "FRK", color: "#7d8bff" },
  Flinched: { kind: "volatile", label: "FLN", color: "#cccccc" },
};

export function applyStatus(mon, status) {
  if (!STATUSES[status]) return false;
  if (STATUSES[status].kind === "persistent") {
    if (mon.status) return false; // already has a persistent status
    mon.status = status;
    return true;
  }
  // volatile
  mon.volatile = mon.volatile || new Set();
  if (mon.volatile.has(status)) return false;
  mon.volatile.add(status);
  return true;
}

// Called before a mon takes its turn. Returns true if turn is skipped, with a message in `log`.
export function preTurn(mon, log) {
  if (mon.volatile?.has("Flinched")) {
    mon.volatile.delete("Flinched");
    log.push(`${mon.name} flinched!`);
    return true;
  }
  if (mon.status === "Liquidated" && chance(33)) {
    log.push(`${mon.name} is liquidated and can't move!`);
    return true;
  }
  return false;
}

// Called at end of turn — apply DoT etc.
export function endTurn(mon, log) {
  if (mon.status === "Slashed") {
    const dmg = Math.max(1, Math.floor(mon.maxHp / 8));
    mon.hp = Math.max(0, mon.hp - dmg);
    log.push(`${mon.name} took ${dmg} from slashing!`);
  }
  // Forked is consumed inside damage calc — clear if still set
  if (mon.volatile?.has("Forked")) {
    // Forked lasts one turn after being applied
  }
}

// Accuracy modifier from status (returns multiplier).
export function accuracyMod(mon) {
  if (mon.status === "FUD") return 0.75;
  return 1.0;
}
