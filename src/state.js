import roster from "./data/roster.js";
import ladder from "./data/ladder.js";
import { makeMon } from "./systems/battle_engine.js";
import { buildStats } from "./systems/leveling.js";

export const SpeciesById = new Map(roster.map((s) => [s.id, s]));
export const Ladder = ladder;
export const Roster = roster;

// Global mutable game state. Modules import this and mutate directly.
export const Game = {
  party: [],          // up to 6 active mons
  pc: [],             // overflow box
  inventory: {
    BlockBall: 5,
    HardCapBall: 2,
    GasPotion: 3,
    FullStack: 0,
    ColdStorage: 1,
  },
  caught: new Set(),  // species ids
  ladderProgress: 0,  // index of next opponent
  flags: {},
};

export function rehydrateMon(saved) {
  const species = SpeciesById.get(saved.speciesId);
  if (!species) return null;
  const mon = makeMon(species, saved.level);
  mon.xp = saved.xp ?? mon.xp;
  mon.hp = Math.min(saved.hp ?? mon.maxHp, mon.maxHp);
  mon.status = saved.status ?? null;
  mon.moves = saved.moves?.length ? saved.moves : mon.moves;
  mon.nickname = saved.nickname ?? null;
  return mon;
}

export function resetGame() {
  Game.party = [];
  Game.pc = [];
  Game.inventory = { BlockBall: 5, HardCapBall: 2, GasPotion: 3, FullStack: 0, ColdStorage: 1 };
  Game.caught = new Set();
  Game.ladderProgress = 0;
  Game.flags = {};
}

export function addToParty(mon) {
  Game.caught.add(mon.species.id);
  if (Game.party.length < 6) Game.party.push(mon);
  else Game.pc.push(mon);
}

export function fullHeal() {
  for (const m of Game.party) {
    m.hp = m.maxHp;
    m.status = null;
    m.volatile = new Set();
    m.abilityUsed = false;
  }
}

export function firstAlive() {
  return Game.party.find((m) => m.hp > 0) || null;
}

export function partyWiped() {
  return Game.party.length > 0 && Game.party.every((m) => m.hp <= 0);
}
