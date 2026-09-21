import { defaultCharacter } from "../data/cosmetics.js";
import { LEVELS } from "../data/levels.js";

const SAVE_KEY = "perfectCatchSave_v1";

function defaultState() {
  return {
    money: 40,
    character: defaultCharacter(),
    owned: { rods: ["cane"], reels: ["spincast"], lures: ["bobber_worm"] },
    equipped: { rod: "cane", reel: "spincast", lure: "bobber_worm" },
    unlockedLevels: [LEVELS[0].id],
    bestCatches: {},
    codeByLevel: {},
    attemptCounter: 0,
    stats: { totalCaught: 0, totalEarnings: 0, linesSnapped: 0 },
  };
}

class GameState {
  constructor() {
    this.data = defaultState();
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...defaultState(), ...parsed };
        this.data.character = { ...defaultCharacter(), ...(parsed.character || {}) };
        this.data.owned = { ...defaultState().owned, ...(parsed.owned || {}) };
        this.data.equipped = { ...defaultState().equipped, ...(parsed.equipped || {}) };
      }
    } catch (e) {
      console.warn("Save data corrupt, starting fresh.", e);
      this.data = defaultState();
    }
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save game", e);
    }
  }

  resetAll() {
    this.data = defaultState();
    this.save();
  }

  get money() { return this.data.money; }
  addMoney(amount) { this.data.money += amount; this.save(); }
  spendMoney(amount) {
    if (this.data.money < amount) return false;
    this.data.money -= amount;
    this.save();
    return true;
  }

  isOwned(category, id) { return this.data.owned[category].includes(id); }
  buy(category, id, price) {
    if (this.isOwned(category, id)) return true;
    if (!this.spendMoney(price)) return false;
    this.data.owned[category].push(id);
    this.save();
    return true;
  }
  equip(category, id) {
    this.data.equipped[category] = id;
    this.save();
  }

  isLevelUnlocked(id) { return this.data.unlockedLevels.includes(id); }
  unlockLevel(id) {
    if (!this.data.unlockedLevels.includes(id)) {
      this.data.unlockedLevels.push(id);
      this.save();
    }
  }

  recordCatch(levelId, fish, payout) {
    this.data.money += payout;
    this.data.stats.totalCaught += 1;
    this.data.stats.totalEarnings += payout;
    const best = this.data.bestCatches[levelId];
    if (!best || fish.weight > best.weight) {
      this.data.bestCatches[levelId] = { name: fish.name, weight: fish.weight };
    }
    this.save();
  }

  recordSnap() {
    this.data.stats.linesSnapped += 1;
    this.save();
  }

  nextAttemptSeed() {
    this.data.attemptCounter += 1;
    this.save();
    return this.data.attemptCounter;
  }

  getSavedCode(levelId, fallback) {
    return this.data.codeByLevel[levelId] ?? fallback;
  }
  saveCode(levelId, code) {
    this.data.codeByLevel[levelId] = code;
    this.save();
  }

  updateCharacter(patch) {
    this.data.character = { ...this.data.character, ...patch };
    this.save();
  }
}

export const gameState = new GameState();
