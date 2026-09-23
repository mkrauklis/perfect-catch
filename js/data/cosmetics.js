const SKIN_TONES = ["#ffe0bd", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#5a3825"];

const HAIR_COLORS = ["#1b1b1b", "#4a2e1c", "#7a4a24", "#c98a3a", "#e8c15a", "#d94f4f", "#8a8a8a", "#e8e8e8"];

const OUTFIT_COLORS = ["#3fb6a8", "#e0a940", "#4d8ee0", "#d9604f", "#6fbf73", "#8a6fd9", "#455a64", "#2a2a2a"];

const HAIR_STYLES = ["bald", "short", "long", "ponytail", "curly", "buzz"];

const OUTFIT_STYLES = ["vest", "flannel", "jacket"];

const HATS = ["none", "bucket", "cap", "widebrim"];

const SUNGLASSES = ["none", "round", "aviator"];

const ACCESSORIES = ["none", "bandana", "badge"];

const BODY_TYPES = ["A", "B", "C"];

function defaultCharacter() {
  return {
    skinTone: SKIN_TONES[1],
    hairColor: HAIR_COLORS[1],
    hairStyle: "long",
    outfitColor: OUTFIT_COLORS[0],
    outfitStyle: "vest",
    hat: "none",
    sunglasses: "none",
    accessory: "none",
    bodyType: "B",
  };
}
