import typesData from "../data/types.js";

export const TYPE_LIST = typesData.types;
export const TYPE_COLORS = typesData.colors;

export function effectiveness(attackType, defenderTypes) {
  let mult = 1;
  const row = typesData.chart[attackType] ?? {};
  for (const t of defenderTypes) {
    if (row[t] !== undefined) mult *= row[t];
  }
  return mult;
}

export function effectivenessMessage(mult) {
  if (mult === 0) return "It had no effect...";
  if (mult >= 2) return "It's super effective!";
  if (mult > 1) return "It's effective!";
  if (mult < 1 && mult > 0) return "It's not very effective...";
  return "";
}
