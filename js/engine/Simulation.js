import { pickFish } from "../data/fish.js";
import { getGearById, RODS, REELS, LURES } from "../data/gear.js";

export class FightEndSignal extends Error {
  constructor(reason) {
    super(reason);
    this.name = "FightEndSignal";
    this.reason = reason;
  }
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Builds a fresh simulation for one fishing attempt. Returns { state, api }.
// `state.log` accumulates a replay-friendly event list consumed by FishingScene.
export function createSimulation({ level, equipped, seed }) {
  const rng = mulberry32(seed);
  const rod = getGearById(RODS, equipped.rod);
  const reel = getGearById(REELS, equipped.reel);
  const lure = getGearById(LURES, equipped.lure);
  const castDistance = level.castDistanceRange[0] + rng() * (level.castDistanceRange[1] - level.castDistanceRange[0]);

  const state = {
    phase: "idle", // idle -> waiting -> fighting -> landed | snapped | timeout
    tension: 0,
    drag: 25,
    lineOut: 0,
    lineCapacity: reel.lineCapacity,
    fish: null,
    fishStamina: 0,
    actionsTaken: 0,
    maxActions: level.maxActions,
    tensionBreak: rod.tensionBreak,
    log: [],
    payout: 0,
  };

  function pushLog(type, extra = {}) {
    state.log.push({
      type,
      t: state.log.length,
      snapshot: {
        phase: state.phase,
        tension: Math.round(state.tension),
        drag: Math.round(state.drag),
        lineOut: Math.round(state.lineOut * 10) / 10,
        fishStaminaPct: state.fish ? Math.round(clamp((state.fishStamina / state.fish.maxStamina) * 100, 0, 100)) : 0,
      },
      ...extra,
    });
  }

  function checkFailure() {
    if (state.tension >= state.tensionBreak) {
      state.phase = "snapped";
      pushLog("snap", { caption: "The line snaps! It's gone." });
      throw new FightEndSignal("snapped");
    }
    if (state.actionsTaken >= state.maxActions) {
      state.phase = "timeout";
      pushLog("timeout", { caption: "The fish works the hook loose and swims off." });
      throw new FightEndSignal("timeout");
    }
  }

  function fishReact(intensity) {
    if (!state.fish) return;
    const staminaPct = clamp(state.fishStamina / state.fish.maxStamina, 0, 1);
    const chance = state.fish.aggression * level.volatility * (0.3 + staminaPct * 0.5) * 0.5;
    if (rng() < chance) {
      const runAmount = (rng() * 3 + 1) * (0.4 + staminaPct * 0.5) * intensity;
      state.lineOut = clamp(state.lineOut + runAmount, 0, state.lineCapacity);
      const dragResist = 1.35 - state.drag / 140;
      state.tension = clamp(state.tension + (runAmount * dragResist) / rod.dragSmoothness, 0, 160);
      state.fishStamina = clamp(state.fishStamina - runAmount * 0.15, 0, state.fish.maxStamina);
      pushLog("run", { caption: `${state.fish.name} makes a run for it!` });
    }
  }

  function requirePhase(name, allowed, errMsg) {
    if (!allowed.includes(state.phase)) {
      if (state.phase === "idle" && errMsg) throw new Error(errMsg);
      pushLog("noop", { caption: `(${name}() had no effect right now.)` });
      return false;
    }
    return true;
  }

  const api = {
    cast() {
      if (state.phase !== "idle") {
        pushLog("noop", { caption: "You already cast your line." });
        return;
      }
      state.phase = "waiting";
      state.lineOut = castDistance;
      state.fish = pickFish(level.id, rng);
      state.fish.value = state.fish.value * (1 + lure.biteBonus);
      state.fishStamina = state.fish.maxStamina * lure.staminaMod;
      pushLog("cast", { caption: `You cast out ${Math.round(castDistance)}m.` });
      pushLog("bite", { caption: `Something bites! A ${state.fish.name}?` });
    },

    setHook() {
      if (state.phase === "idle") {
        throw new Error("You need to cast() before you can setHook(). Order matters!");
      }
      if (state.phase !== "waiting") {
        pushLog("noop", { caption: "(setHook() had no effect right now.)" });
        return;
      }
      state.phase = "fighting";
      state.tension = 18;
      state.actionsTaken++;
      pushLog("set_hook", { caption: "Hook set! The fight is on." });
      checkFailure();
    },

    reelIn(amount) {
      if (state.phase === "idle") throw new Error("Nothing is happening yet — call cast() first.");
      if (state.phase === "waiting") throw new Error("You've got a bite! Call setHook() before you reel.");
      if (!requirePhase("reelIn", ["fighting"])) return;
      const amt = clamp(Number(amount) || 0, 0, 15);
      state.actionsTaken++;
      const eff = reel.reelEfficiency * (0.85 + state.drag / 220);
      state.lineOut = clamp(state.lineOut - amt * eff, 0, state.lineCapacity);
      state.fishStamina = clamp(state.fishStamina - amt * 1.0 * (1 - state.fish.aggression * 0.25), 0, state.fish.maxStamina);
      state.tension = clamp(state.tension + (amt * (0.6 + state.drag / 160)) / rod.dragSmoothness, 0, 160);
      pushLog("reel_in", { caption: `Reel in ${amt.toFixed(1)}.` });
      fishReact(1.0);
      checkFailure();
    },

    letOut(amount) {
      if (state.phase === "idle") throw new Error("Nothing is happening yet — call cast() first.");
      if (state.phase === "waiting") throw new Error("You've got a bite! Call setHook() before you let out line.");
      if (!requirePhase("letOut", ["fighting"])) return;
      const amt = clamp(Number(amount) || 0, 0, 15);
      state.actionsTaken++;
      state.lineOut = clamp(state.lineOut + amt, 0, state.lineCapacity);
      state.tension = clamp(state.tension - (amt * 1.1) / rod.dragSmoothness, 0, 160);
      state.fishStamina = clamp(state.fishStamina - amt * 0.08, 0, state.fish.maxStamina);
      pushLog("let_out", { caption: `Let out ${amt.toFixed(1)} of line.` });
      fishReact(0.6);
      checkFailure();
    },

    setDrag(percent) {
      if (state.phase === "idle") throw new Error("Nothing is happening yet — call cast() first.");
      if (!requirePhase("setDrag", ["waiting", "fighting"])) return;
      const p = clamp(Number(percent) || 0, 0, 100);
      state.actionsTaken++;
      if (state.phase === "fighting" && p > state.drag) {
        state.tension = clamp(state.tension + (p - state.drag) * 0.06, 0, 160);
      }
      state.drag = p;
      pushLog("set_drag", { caption: `Drag set to ${Math.round(p)}%.` });
      checkFailure();
    },

    pullRod() {
      if (state.phase === "idle") throw new Error("Nothing is happening yet — call cast() first.");
      if (state.phase === "waiting") throw new Error("You've got a bite! Call setHook() before pumping the rod.");
      if (!requirePhase("pullRod", ["fighting"])) return;
      state.actionsTaken++;
      state.fishStamina = clamp(state.fishStamina - 9 * (1 - state.fish.aggression * 0.2), 0, state.fish.maxStamina);
      state.tension = clamp(state.tension + 11 / rod.dragSmoothness, 0, 160);
      state.lineOut = clamp(state.lineOut - 2.5 * reel.reelEfficiency, 0, state.lineCapacity);
      pushLog("pull_rod", { caption: "You pump the rod back hard." });
      fishReact(1.1);
      checkFailure();
    },

    land() {
      if (state.phase === "idle" || state.phase === "waiting") {
        throw new Error("There's no fish on the line to land yet.");
      }
      if (state.phase !== "fighting") {
        pushLog("noop", { caption: "(land() had no effect right now.)" });
        return;
      }
      state.actionsTaken++;
      const staminaPct = state.fishStamina / state.fish.maxStamina;
      if (state.lineOut <= 2.5 && staminaPct <= level.landStaminaPct) {
        state.phase = "landed";
        const payout = Math.round(state.fish.weight * state.fish.value);
        state.payout = payout;
        pushLog("land_success", { caption: `You land the ${state.fish.name}! (${state.fish.weight}kg)`, payout });
      } else {
        state.tension = clamp(state.tension + 8, 0, 160);
        pushLog("land_fail", { caption: "Not yet — the fish still has fight left." });
        fishReact(0.8);
        checkFailure();
      }
    },

    getTension() { return Math.round(state.tension); },
    getDrag() { return Math.round(state.drag); },
    getLineOut() { return Math.round(state.lineOut * 10) / 10; },
    getFishStamina() {
      if (!state.fish) return 100;
      return Math.round(clamp((state.fishStamina / state.fish.maxStamina) * 100, 0, 100));
    },
    isHooked() { return state.phase === "fighting"; },
    isLanded() { return state.phase === "landed"; },
    isDone() { return state.phase === "landed" || state.phase === "snapped" || state.phase === "timeout"; },
    log(msg) {
      pushLog("user_log", { caption: String(msg) });
    },
  };

  return { state, api, fishPreview: () => state.fish };
}
