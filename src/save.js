const KEY = "obg_pokemon_save_v1";

export function saveGame(state) {
  try {
    const payload = {
      party: state.party.map(serializeMon),
      pc: state.pc.map(serializeMon),
      inventory: state.inventory,
      ladderProgress: state.ladderProgress,
      caught: Array.from(state.caught),
      timestamp: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("save failed", e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

export function hasSave() {
  return !!localStorage.getItem(KEY);
}

function serializeMon(m) {
  return {
    speciesId: m.species.id,
    level: m.level,
    xp: m.xp,
    hp: m.hp,
    status: m.status,
    moves: m.moves,
    nickname: m.nickname || null,
  };
}
