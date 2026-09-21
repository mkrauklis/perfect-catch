// maxStamina, aggression (0-1, chance/strength of runs), minWeight/maxWeight (kg),
// value ($ per kg), bodyColor/finColor for procedural drawing, giant (bool, scales up rendering).

export const FISH_SPECIES = {
  pond: [
    { id: "sunfish", name: "Sunfish", maxStamina: 35, aggression: 0.15, minWeight: 0.2, maxWeight: 0.6, value: 12, bodyColor: "#e0a940", finColor: "#c9862c" },
    { id: "bass", name: "Largemouth Bass", maxStamina: 50, aggression: 0.25, minWeight: 0.8, maxWeight: 2.2, value: 15, bodyColor: "#4a6b3a", finColor: "#33492a" },
  ],
  stream: [
    { id: "trout", name: "Rainbow Trout", maxStamina: 65, aggression: 0.35, minWeight: 0.5, maxWeight: 1.8, value: 20, bodyColor: "#a7c6e0", finColor: "#e06f8c" },
    { id: "grayling", name: "Arctic Grayling", maxStamina: 60, aggression: 0.4, minWeight: 0.4, maxWeight: 1.2, value: 22, bodyColor: "#7d8fa8", finColor: "#5a6b8a" },
  ],
  river: [
    { id: "pike", name: "Northern Pike", maxStamina: 100, aggression: 0.55, minWeight: 2, maxWeight: 6, value: 28, bodyColor: "#3d5c3a", finColor: "#26401f" },
    { id: "muskie", name: "Muskellunge", maxStamina: 120, aggression: 0.65, minWeight: 4, maxWeight: 10, value: 35, bodyColor: "#6b7a5a", finColor: "#48533d" },
  ],
  ocean: [
    { id: "tuna", name: "Bluefin Tuna", maxStamina: 220, aggression: 0.7, minWeight: 40, maxWeight: 120, value: 45, bodyColor: "#274a6b", finColor: "#17324a", giant: true },
    { id: "marlin", name: "Blue Marlin", maxStamina: 280, aggression: 0.8, minWeight: 60, maxWeight: 180, value: 60, bodyColor: "#1c4d6b", finColor: "#123246", giant: true },
    { id: "leviathan", name: "The Old One", maxStamina: 400, aggression: 0.9, minWeight: 200, maxWeight: 350, value: 120, bodyColor: "#152838", finColor: "#0b1620", giant: true },
  ],
};

export function pickFish(levelId, rng) {
  const pool = FISH_SPECIES[levelId];
  const species = pool[Math.floor(rng() * pool.length)];
  const weight = species.minWeight + rng() * (species.maxWeight - species.minWeight);
  return { ...species, weight: Math.round(weight * 10) / 10 };
}
