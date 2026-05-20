// Passive abilities. Each ability declares hook functions.
// Hooks receive { mon, foe, move, dmg, log } and may mutate them.

export const ABILITIES = {
  GasOptimizer: {
    label: "Gas Optimizer",
    desc: "Cuts incoming special damage by 15%.",
    onDamage(ctx) {
      if (ctx.move?.category === "special") {
        ctx.dmg = Math.floor(ctx.dmg * 0.85);
      }
    },
  },
  DiamondHands: {
    label: "Diamond Hands",
    desc: "Survives a knockout once at 1 HP.",
    onLethal(ctx) {
      if (!ctx.mon.abilityUsed) {
        ctx.mon.abilityUsed = true;
        ctx.mon.hp = 1;
        ctx.log.push(`${ctx.mon.name} held on with Diamond Hands!`);
        return true;
      }
      return false;
    },
  },
};

export function trigger(hook, ctx) {
  const a = ABILITIES[ctx.mon.species.ability];
  if (a && typeof a[hook] === "function") return a[hook](ctx);
  return undefined;
}
