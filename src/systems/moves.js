import movesData from "../data/moves.js";
import { effectiveness, effectivenessMessage } from "./types.js";
import { applyStatus, accuracyMod } from "./statuses.js";
import { trigger } from "./abilities.js";
import { rand, chance } from "./rng.js";

export function getMove(name) {
  return movesData[name];
}

// Execute a move from attacker -> defender. Returns { dmg, missed, effects: [...] }.
export function executeMove(attacker, defender, moveName, log) {
  const move = movesData[moveName];
  if (!move) {
    log.push(`${attacker.name} forgot how to do that.`);
    return { dmg: 0, missed: true, effects: [] };
  }

  log.push(`${attacker.name} used ${moveName}!`);

  // accuracy
  const acc = (move.accuracy ?? 100) * accuracyMod(attacker);
  if (!chance(acc)) {
    log.push(`${attacker.name}'s attack missed!`);
    return { dmg: 0, missed: true, effects: [] };
  }

  let dmg = 0;
  if (move.category !== "status" && move.power > 0) {
    dmg = calcDamage(attacker, defender, move);

    // ability hooks on damage
    const ctx = { mon: defender, foe: attacker, move, dmg, log };
    trigger("onDamage", ctx);
    dmg = ctx.dmg;

    // Forked volatile halves damage and is consumed
    if (defender.volatile?.has("Forked")) {
      dmg = Math.floor(dmg / 2);
      defender.volatile.delete("Forked");
    }

    const eff = effectiveness(move.type, defender.species.types);
    const effMsg = effectivenessMessage(eff);
    if (effMsg) log.push(effMsg);

    // Diamond-Hands-like lethal save
    if (dmg >= defender.hp) {
      const saved = trigger("onLethal", { mon: defender, foe: attacker, move, dmg, log });
      if (saved) {
        return { dmg: defender.maxHp - 1, missed: false, effects: [] };
      }
    }

    defender.hp = Math.max(0, defender.hp - dmg);
    log.push(`${defender.name} took ${dmg} damage!`);
  }

  // status / secondary effect
  if (move.effect) {
    const c = move.effectChance ?? 100;
    if (chance(c)) {
      const applied = applyStatus(defender, move.effect);
      if (applied) log.push(`${defender.name} is ${move.effect.toUpperCase()}!`);
    }
  }

  return { dmg, missed: false, effects: [] };
}

// Gen-V-style damage formula.
export function calcDamage(attacker, defender, move) {
  const L = attacker.level;
  const P = move.power;
  const isPhys = move.category === "physical";
  const A = isPhys ? attacker.stats.atk : attacker.stats.spa;
  const D = isPhys ? defender.stats.def : defender.stats.spd;

  let dmg = Math.floor(((2 * L) / 5 + 2) * P * (A / Math.max(1, D)) / 50) + 2;

  // STAB
  if (attacker.species.types.includes(move.type)) dmg = Math.floor(dmg * 1.5);

  // Type effectiveness
  const eff = effectiveness(move.type, defender.species.types);
  dmg = Math.floor(dmg * eff);

  // Crit (6.25%)
  if (chance(6.25)) {
    dmg = Math.floor(dmg * 1.5);
  }

  // Random 0.85–1.0
  const r = 0.85 + rand() * 0.15;
  dmg = Math.max(1, Math.floor(dmg * r));

  return dmg;
}

export function movePriority(name) {
  return movesData[name]?.priority ?? 0;
}
