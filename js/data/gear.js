// Gear stats:
// tensionBreak   - line/rod snaps above this tension (0-100 scale)
// reelEfficiency - multiplier on reelIn()/letOut() effectiveness
// dragSmoothness - reduces tension spikes caused by drag changes & fish runs
// lineCapacity   - max lineOut before it's simply clamped

const RODS = [
  { id: "cane", name: "Cane Pole", price: 0, tensionBreak: 70, dragSmoothness: 1.0, desc: "A humble bamboo pole. Forgiving, but weak." },
  { id: "river_rod", name: "River Rod", price: 150, tensionBreak: 80, dragSmoothness: 1.15, desc: "Fiberglass rod with real backbone." },
  { id: "graphite_pro", name: "Graphite Pro", price: 450, tensionBreak: 105, dragSmoothness: 1.3, desc: "Light, stiff, sensitive to every tap." },
  { id: "big_game", name: "Big Game Rod", price: 1400, tensionBreak: 150, dragSmoothness: 1.5, desc: "Built to survive a sea monster." },
];

const REELS = [
  { id: "spincast", name: "Basic Spincast", price: 0, reelEfficiency: 1.0, dragSmoothness: 1.0, lineCapacity: 40, desc: "Simple, reliable, a little clunky." },
  { id: "baitcast", name: "Smooth Baitcaster", price: 220, reelEfficiency: 1.25, dragSmoothness: 1.2, lineCapacity: 60, desc: "Precise drag control, less tension shock." },
  { id: "offshore", name: "Offshore Conventional", price: 950, reelEfficiency: 1.5, dragSmoothness: 1.35, lineCapacity: 120, desc: "Built for line-ripping runs." },
  { id: "giant_slayer", name: "Giant Slayer", price: 2200, reelEfficiency: 1.8, dragSmoothness: 1.6, lineCapacity: 200, desc: "The reel of choice for giants." },
];

const LURES = [
  { id: "bobber_worm", name: "Bobber & Worm", price: 0, biteBonus: 0, staminaMod: 1.0, desc: "Classic. Works everywhere, excites nobody." },
  { id: "spinner", name: "Spinner", price: 60, biteBonus: 0.1, staminaMod: 0.95, desc: "Flash and vibration stream fish love." },
  { id: "crankbait", name: "Crankbait", price: 180, biteBonus: 0.15, staminaMod: 0.9, desc: "Digs deep for river predators." },
  { id: "trolling_giant", name: "Giant Trolling Lure", price: 600, biteBonus: 0.2, staminaMod: 0.85, desc: "A meal too big for small fish to bother with." },
];

function getGearById(list, id) {
  return list.find((g) => g.id === id);
}
