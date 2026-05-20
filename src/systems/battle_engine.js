import { executeMove, movePriority } from "./moves.js";
import { preTurn, endTurn } from "./statuses.js";
import { buildStats, xpFromKO, levelFromXp } from "./leveling.js";
import { rand } from "./rng.js";

// Resolve one round: both sides choose a move (or item), execute in priority/speed order.
// Returns log array.
export function resolveTurn({ playerAction, foeAction, player, foe }) {
  const log = [];
  const actions = [
    { side: "player", actor: player, target: foe, action: playerAction },
    { side: "foe", actor: foe, target: player, action: foeAction },
  ];
  // Item / catch actions always go first.
  actions.sort((a, b) => {
    const ap = actionOrder(a.action);
    const bp = actionOrder(b.action);
    if (ap !== bp) return bp - ap;
    if (a.action.kind === "move" && b.action.kind === "move") {
      const aPrio = movePriority(a.action.move);
      const bPrio = movePriority(b.action.move);
      if (aPrio !== bPrio) return bPrio - aPrio;
      const sa = a.actor.stats.spe;
      const sb = b.actor.stats.spe;
      if (sa !== sb) return sb - sa;
      return rand() < 0.5 ? -1 : 1;
    }
    return 0;
  });

  for (const { actor, target, action } of actions) {
    if (actor.hp <= 0 || target.hp <= 0) continue;
    if (action.kind === "move") {
      if (preTurn(actor, log)) continue;
      executeMove(actor, target, action.move, log);
    } else if (action.kind === "switch") {
      // handled by caller before reaching here normally
    } else if (action.kind === "item") {
      log.push(`Used ${action.item}.`);
    } else if (action.kind === "ball") {
      // catch handled by caller
    } else if (action.kind === "run") {
      log.push("Got away safely!");
    }
  }

  // End-of-turn ticks (only for living mons)
  if (player.hp > 0) endTurn(player, log);
  if (foe.hp > 0) endTurn(foe, log);

  return log;
}

function actionOrder(a) {
  if (a.kind === "ball" || a.kind === "item" || a.kind === "run" || a.kind === "switch") return 10;
  return 0;
}

// Build a battle-ready mon from a species definition + level. Used for foes.
export function makeMon(species, level) {
  const stats = buildStats(species, level);
  return {
    name: species.name,
    species,
    level,
    xp: level ** 3,
    stats,
    hp: stats.hp,
    maxHp: stats.hp,
    moves: species.moves.slice(0, 4),
    status: null,
    volatile: new Set(),
    abilityUsed: false,
  };
}

// Apply XP to a party mon. Returns array of level-up logs.
export function grantXp(mon, gained) {
  const logs = [];
  mon.xp += gained;
  logs.push(`${mon.name} gained ${gained} XP!`);
  const newLevel = levelFromXp(mon.xp);
  while (mon.level < newLevel) {
    mon.level++;
    const oldMax = mon.maxHp;
    const stats = buildStats(mon.species, mon.level);
    mon.stats = stats;
    mon.maxHp = stats.hp;
    mon.hp += stats.hp - oldMax; // gain the new HP
    logs.push(`${mon.name} grew to level ${mon.level}!`);
  }
  return logs;
}

export { xpFromKO };
