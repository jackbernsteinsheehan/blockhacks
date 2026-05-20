// Medium-fast XP curve: level^3 XP to reach a level.
export function xpForLevel(level) {
  return Math.floor(level ** 3);
}

export function levelFromXp(xp) {
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}

// Stat at level L given base. Simplified Pokémon formula (no IV/EV).
export function statAt(base, level, isHp = false) {
  if (isHp) {
    return Math.floor((2 * base * level) / 100) + level + 10;
  }
  return Math.floor((2 * base * level) / 100) + 5;
}

export function buildStats(species, level) {
  const b = species.baseStats;
  return {
    hp: statAt(b.hp, level, true),
    atk: statAt(b.atk, level),
    def: statAt(b.def, level),
    spa: statAt(b.spa, level),
    spd: statAt(b.spd, level),
    spe: statAt(b.spe, level),
  };
}

// XP yielded when defeating a defeated mon, scaled by level.
export function xpFromKO(defeated) {
  return Math.floor((defeated.species.xpYield * defeated.level) / 7);
}
