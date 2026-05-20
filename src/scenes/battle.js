import { clear, text, panel, W, H } from "../ui/canvas.js";
import { drawMonSprite } from "../ui/sprites.js";
import { Menu } from "../ui/menu.js";
import { TextBox } from "../ui/text.js";
import { Input } from "../input.js";
import { Game, Ladder, SpeciesById, firstAlive, addToParty } from "../state.js";
import { makeMon, resolveTurn, grantXp, xpFromKO } from "../systems/battle_engine.js";
import { attemptCatch } from "../systems/catch.js";
import { getMove } from "../systems/moves.js";
import { STATUSES } from "../systems/statuses.js";
import { saveGame } from "../save.js";
import { LadderScene } from "./ladder.js";
import { CatchScene } from "./catch.js";
import itemsData from "../data/items.js";

// Phases: intro -> command -> fight/bag/party -> resolve -> messages -> command | end
export class BattleScene {
  constructor(ladderEntry) {
    this.ladderEntry = ladderEntry;
    this.isFinalBoss = !!ladderEntry.boss;
    this.foeQueue = ladderEntry.party
      ? ladderEntry.party.map((e) => ({ id: e.id, level: e.level }))
      : [{ id: ladderEntry.id, level: ladderEntry.level }];
    this.foeIndex = 0;
  }
  enter() {
    this.player = firstAlive();
    this.foe = this.spawnNextFoe();
    this.phase = "intro";
    this.introBox = new TextBox(
      this.isFinalBoss
        ? [`The President steps forward!`, `${this.foe.species.title} ${this.foe.name} wants to keep their seat!`]
        : [`${this.foe.species.title} ${this.foe.name} challenges you!`],
      { onDone: () => this.beginCommand() }
    );
    this.log = [];
    this.logBox = null;
    this.menuStack = [];
  }
  spawnNextFoe() {
    const cur = this.foeQueue[this.foeIndex];
    const sp = SpeciesById.get(cur.id);
    return makeMon(sp, cur.level);
  }
  beginCommand() {
    this.phase = "command";
    this.menuStack = [this.makeRootMenu()];
  }
  makeRootMenu() {
    return new Menu(
      [{ label: "FIGHT" }, { label: "BAG" }, { label: "PARTY" }, { label: "RUN" }],
      {
        columns: 2,
        onConfirm: (it) => {
          if (it.label === "FIGHT") this.menuStack.push(this.makeFightMenu());
          else if (it.label === "BAG") this.menuStack.push(this.makeBagMenu());
          else if (it.label === "PARTY") this.menuStack.push(this.makePartyMenu());
          else if (it.label === "RUN") this.tryRun();
        },
      }
    );
  }
  makeFightMenu() {
    const items = this.player.moves.map((m) => {
      const def = getMove(m);
      return { label: `${m}`, sub: `${def.type} P${def.power || "-"} A${def.accuracy}`, move: m };
    });
    return new Menu(items, {
      columns: 2,
      onConfirm: (it) => this.submit({ kind: "move", move: it.move }),
      onCancel: () => this.menuStack.pop(),
    });
  }
  makeBagMenu() {
    const entries = Object.entries(Game.inventory).filter(([, n]) => n > 0);
    const items = entries.map(([id, n]) => {
      const def = itemsData[id];
      return { label: `${def.label} x${n}`, id, kind: def.kind };
    });
    if (!items.length) items.push({ label: "(empty)", disabled: true });
    return new Menu(items, {
      onConfirm: (it) => {
        if (it.disabled) return;
        this.useItem(it.id);
      },
      onCancel: () => this.menuStack.pop(),
      disabled: (it) => it.disabled,
    });
  }
  makePartyMenu() {
    const items = Game.party.map((m, i) => ({
      label: `${m.name} L${m.level} HP ${m.hp}/${m.maxHp}${m.status ? " " + STATUSES[m.status].label : ""}`,
      index: i,
      mon: m,
    }));
    return new Menu(items, {
      onConfirm: (it) => {
        if (it.mon === this.player) {
          this.flash("Already out!");
          return;
        }
        if (it.mon.hp <= 0) {
          this.flash("Fainted!");
          return;
        }
        this.submit({ kind: "switch", target: it.mon });
      },
      onCancel: () => this.menuStack.pop(),
    });
  }
  flash(msg) {
    this.log = [msg];
    this.logBox = new TextBox(this.log, { onDone: () => this.beginCommand() });
    this.phase = "messages";
  }
  useItem(id) {
    const def = itemsData[id];
    if (def.kind === "ball") {
      Game.inventory[id]--;
      this.submit({ kind: "ball", item: id });
    } else if (def.kind === "heal") {
      if (this.player.hp >= this.player.maxHp) {
        this.flash("HP is already full!");
        return;
      }
      Game.inventory[id]--;
      const before = this.player.hp;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + def.amount);
      const healed = this.player.hp - before;
      this.queueMessages([`Used ${def.label}. ${this.player.name} healed ${healed} HP.`]);
    } else if (def.kind === "revive") {
      const fainted = Game.party.find((m) => m.hp <= 0);
      if (!fainted) {
        this.flash("Nothing to revive.");
        return;
      }
      Game.inventory[id]--;
      fainted.hp = Math.floor(fainted.maxHp * def.amount);
      fainted.status = null;
      this.queueMessages([`Used ${def.label}. ${fainted.name} revived!`]);
    }
  }
  submit(action) {
    this.playerAction = action;
    this.foeAction = this.chooseFoeMove();
    if (action.kind === "ball") {
      this.resolveBall(action.item);
      return;
    }
    if (action.kind === "switch") {
      this.player = action.target;
      this.queueMessages([`Go, ${this.player.name}!`], () => this.runFoeOnly());
      return;
    }
    const log = resolveTurn({
      playerAction: this.playerAction,
      foeAction: this.foeAction,
      player: this.player,
      foe: this.foe,
    });
    this.queueMessages(log, () => this.afterTurn());
  }
  runFoeOnly() {
    const log = resolveTurn({
      playerAction: { kind: "skip" },
      foeAction: this.foeAction,
      player: this.player,
      foe: this.foe,
    });
    this.queueMessages(log, () => this.afterTurn());
  }
  chooseFoeMove() {
    const m = this.foe.moves[Math.floor(Math.random() * this.foe.moves.length)];
    return { kind: "move", move: m };
  }
  queueMessages(lines, after) {
    this.phase = "messages";
    this.logBox = new TextBox(lines, {
      onDone: () => {
        if (after) after();
        else this.afterTurn();
      },
    });
  }
  resolveBall(itemId) {
    const result = attemptCatch(this.foe, itemId);
    const lines = [`You threw a ${itemsData[itemId].label}!`];
    if (result.caught) {
      lines.push(`Gotcha! ${this.foe.name} was caught!`);
    } else {
      lines.push(`Shook ${result.shakes} time(s)... it broke free!`);
    }
    this.phase = "messages";
    this.logBox = new TextBox(lines, {
      onDone: () => {
        if (result.caught) {
          const caughtMon = this.foe;
          addToParty(caughtMon);
          if (this.isFinalBoss) this.foeIndex++; // count as defeated for boss progression
          this.endBattle("caught", caughtMon);
        } else {
          // foe takes its turn
          const log = resolveTurn({
            playerAction: { kind: "skip" },
            foeAction: this.foeAction,
            player: this.player,
            foe: this.foe,
          });
          this.queueMessages(log, () => this.afterTurn());
        }
      },
    });
  }
  afterTurn() {
    if (this.foe.hp <= 0) {
      const xp = xpFromKO(this.foe);
      const logs = grantXp(this.player, xp);
      this.queueMessages([`${this.foe.name} fainted!`, ...logs], () => this.foeDown());
      return;
    }
    if (this.player.hp <= 0) {
      const next = Game.party.find((m) => m.hp > 0 && m !== this.player);
      if (next) {
        this.player = next;
        this.queueMessages([`${this.player.name} fainted!`, `Go, ${next.name}!`], () => this.beginCommand());
      } else {
        this.queueMessages([`${this.player.name} fainted!`, `You're out of usable Pokémon!`], () => this.endBattle("loss"));
      }
      return;
    }
    this.beginCommand();
  }
  foeDown() {
    // boss: next mon?
    this.foeIndex++;
    if (this.foeIndex < this.foeQueue.length) {
      this.foe = this.spawnNextFoe();
      this.queueMessages([`${this.foe.species.title} sends out ${this.foe.name}!`], () => this.beginCommand());
    } else {
      this.endBattle("ko");
    }
  }
  tryRun() {
    if (this.isFinalBoss) {
      this.flash("You can't run from the President!");
      return;
    }
    this.queueMessages(["Got away safely!"], () => this.endBattle("ran"));
  }
  endBattle(result, caughtMon = null) {
    if (result === "ko" || result === "caught") {
      Game.ladderProgress = Math.max(Game.ladderProgress, this.ladderEntry === Ladder[Ladder.length - 1] ? Ladder.length : Ladder.indexOf(this.ladderEntry) + 1);
      // reward: every two wins, give a ball
      if (Game.ladderProgress % 2 === 0) Game.inventory.BlockBall = (Game.inventory.BlockBall || 0) + 1;
    }
    saveGame(Game);
    if (result === "ko" && !this.isFinalBoss) {
      // offer post-fight catch (re-attempt) only for non-boss — players use balls mid-battle
      this._scenes.set(new LadderScene());
    } else if (result === "caught") {
      this._scenes.set(new CatchScene(caughtMon, () => this._scenes.set(new LadderScene())));
    } else {
      this._scenes.set(new LadderScene());
    }
  }
  update(dt, scenes) {
    this._scenes = scenes;
    if (this.phase === "intro") {
      this.introBox.update(dt);
      if (Input.wasPressed("confirm")) this.introBox.advance();
    } else if (this.phase === "command") {
      this.menuStack[this.menuStack.length - 1].update();
      if (Input.wasPressed("cancel") && this.menuStack.length > 1) {
        this.menuStack.pop();
      }
    } else if (this.phase === "messages") {
      this.logBox.update(dt);
      if (Input.wasPressed("confirm")) this.logBox.advance();
    }
  }
  draw(ctx) {
    clear(ctx, "#102030");
    // Field
    panel(ctx, 4, 4, W - 8, 160, { fill: "#1a2848", border: "#3a4988" });
    // Foe sprite top-right
    drawMonSprite(ctx, this.foe.species, W - 80, 16, 64);
    this.drawHpBar(ctx, this.foe, 12, 20, false);
    // Player sprite bottom-left
    drawMonSprite(ctx, this.player.species, 16, 92, 64);
    this.drawHpBar(ctx, this.player, W - 132, 100, true);

    if (this.phase === "intro") this.introBox.draw(ctx);
    else if (this.phase === "messages") this.logBox.draw(ctx);
    else if (this.phase === "command") {
      const m = this.menuStack[this.menuStack.length - 1];
      // bottom action menu
      m.draw(ctx, 12, 174, 148, 14);
      // right panel showing context
      panel(ctx, 168, 168, W - 176, 64);
      if (this.menuStack.length === 1) {
        text(ctx, "What will", 176, 178, { size: 10, color: "#fff" });
        text(ctx, `${this.player.name} do?`, 176, 192, { size: 10, color: "#ffd75e" });
      } else {
        // Show details for current hover
        const sel = m.items[m.index];
        if (sel?.move) {
          const def = getMove(sel.move);
          text(ctx, sel.move, 176, 174, { size: 10, color: "#ffd75e" });
          text(ctx, `Type ${def.type}`, 176, 188, { size: 9, color: "#9d9dff" });
          text(ctx, `Pwr ${def.power || "-"} Acc ${def.accuracy}`, 176, 200, { size: 9, color: "#fff" });
          text(ctx, `${def.category}`, 176, 212, { size: 9, color: "#aaa" });
        } else {
          text(ctx, "Pick an option", 176, 188, { size: 10, color: "#fff" });
        }
      }
    }
  }
  drawHpBar(ctx, mon, x, y, isPlayer) {
    panel(ctx, x, y, 120, isPlayer ? 36 : 28, { fill: "#0e1430" });
    text(ctx, `${mon.name}`, x + 6, y + 4, { size: 10, color: "#ffd75e" });
    text(ctx, `L${mon.level}`, x + 96, y + 4, { size: 10, color: "#fff" });
    // bar
    const bx = x + 8, by = y + 18, bw = 104, bh = 4;
    ctx.fillStyle = "#222";
    ctx.fillRect(bx, by, bw, bh);
    const ratio = Math.max(0, mon.hp / mon.maxHp);
    const c = ratio > 0.5 ? "#5fd86a" : ratio > 0.2 ? "#e6c84a" : "#e64a4a";
    ctx.fillStyle = c;
    ctx.fillRect(bx, by, Math.floor(bw * ratio), bh);
    if (isPlayer) {
      text(ctx, `${mon.hp}/${mon.maxHp}`, x + 96, y + 24, { size: 9, color: "#fff", align: "right" });
    }
    if (mon.status) {
      const s = STATUSES[mon.status];
      ctx.fillStyle = s.color;
      ctx.fillRect(x + 6, y + 24, 22, 8);
      text(ctx, s.label, x + 17, y + 25, { size: 8, color: "#000", align: "center" });
    }
  }
}
