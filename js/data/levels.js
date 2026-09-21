export const LEVELS = [
  {
    id: "pond",
    order: 0,
    name: "The Quiet Pond",
    subtitle: "Adventure 1",
    concept: "functions",
    conceptLabel: "Calling Functions",
    envTheme: {
      sky: ["#7fb8c9", "#cfe8d8"],
      water: ["#3a7d6b", "#1f4d42"],
      accent: "#e0a940",
      decor: "lilypads",
    },
    castDistanceRange: [10, 16],
    volatility: 0.15,
    maxActions: 60,
    landStaminaPct: 0.25,
    tutorial: {
      intro: "Every great fishing trip starts with calling a few functions, one after another. Your rod is code — cast it, set the hook, and reel it in, one call at a time.",
      points: [
        "Call <code>cast()</code> to send your line out.",
        "Call <code>setHook()</code> once the fish bites.",
        "Call <code>reelIn(amount)</code> a few times to bring it in.",
        "Call <code>land()</code> when the fish is close and tired.",
      ],
      hint: "Try running the starter code as-is first, then tweak the numbers.",
    },
    starterCode: `// Adventure 1: The Quiet Pond
// Calling functions, one after another, in order.

cast();
setHook();
reelIn(5);
reelIn(5);
reelIn(5);
reelIn(5);
land();
`,
  },
  {
    id: "stream",
    order: 1,
    name: "Whisper Stream",
    subtitle: "Adventure 2",
    concept: "variables",
    conceptLabel: "Declaring Variables",
    envTheme: {
      sky: ["#a9cbd6", "#e8f0d8"],
      water: ["#4d90b0", "#2b5f7a"],
      accent: "#4d8ee0",
      decor: "rocks",
    },
    castDistanceRange: [14, 22],
    volatility: 0.3,
    maxActions: 80,
    landStaminaPct: 0.22,
    tutorial: {
      intro: "The current here tugs at your line unpredictably. Instead of retyping the same numbers everywhere, store them in variables — so you can tune your whole strategy by changing one line.",
      points: [
        "Declare a variable: <code>let power = 4;</code>",
        "Reuse it: <code>reelIn(power);</code>",
        "Try <code>let drag = 35; setDrag(drag);</code> to fight the current.",
        "Use <code>letOut(amount)</code> if tension gets high.",
      ],
      hint: "Give your numbers names. It makes the whole script easier to tune.",
    },
    starterCode: `// Adventure 2: Whisper Stream
// Declaring variables so numbers have names.

let power = 4;
let drag = 30;

cast();
setDrag(drag);
setHook();

reelIn(power);
reelIn(power);
reelIn(power);
reelIn(power);
reelIn(power);
land();
`,
  },
  {
    id: "river",
    order: 2,
    name: "The Mighty St. Lawrence",
    subtitle: "Adventure 3",
    concept: "conditionals",
    conceptLabel: "Conditionals",
    envTheme: {
      sky: ["#6f93a8", "#b9c9c2"],
      water: ["#2e5a75", "#173447"],
      accent: "#d9604f",
      decor: "current",
    },
    castDistanceRange: [20, 32],
    volatility: 0.55,
    maxActions: 140,
    landStaminaPct: 0.2,
    tutorial: {
      intro: "River pike fight dirty — sudden runs, spikes in tension. A fixed sequence of moves will snap your line. Check the line's tension and the fish's stamina, and react.",
      points: [
        "Read state: <code>getTension()</code>, <code>getFishStamina()</code>.",
        "Branch: <code>if (getTension() > 70) { letOut(4); } else { reelIn(4); }</code>",
        "Loosen the drag when things get hot: <code>setDrag(20)</code>.",
        "Call <code>land()</code> only once the fish is worn down and close.",
      ],
      hint: "A single if/else, checked repeatedly, beats any fixed plan here.",
    },
    starterCode: `// Adventure 3: The Mighty St. Lawrence
// Conditionals: react to what the line is telling you.

cast();
setHook();

if (getTension() > 70) {
  letOut(4);
} else {
  reelIn(4);
}

if (getTension() > 70) {
  letOut(4);
} else {
  reelIn(4);
}

// Tip: repeating this block manually gets old fast...
// Adventure 4 will show you a much better way.

land();
`,
  },
  {
    id: "ocean",
    order: 3,
    name: "Open Ocean",
    subtitle: "Adventure 4 — Finale",
    concept: "loops-functions",
    conceptLabel: "Loops & Your Own Functions",
    envTheme: {
      sky: ["#274158", "#0f2033"],
      water: ["#0d3350", "#061a2b"],
      accent: "#3fb6a8",
      decor: "waves",
    },
    castDistanceRange: [35, 55],
    volatility: 0.75,
    maxActions: 500,
    landStaminaPct: 0.15,
    tutorial: {
      intro: "Out here, fish are enormous and fights last a long time. Manually repeating the same block hundreds of times isn't practical. Write your own function to hold your strategy, then loop it until the fish is landed.",
      points: [
        "Define your own function: <code>function manageFight() { ... }</code>",
        "Loop until done: <code>while (!isLanded()) { manageFight(); }</code>",
        "Combine everything you've learned: variables, conditionals, functions, loops.",
        "Giants have huge stamina — be patient, and mind the tension.",
      ],
      hint: "One well-written function, called in a loop, can fight an entire giant fish.",
    },
    starterCode: `// Adventure 4: Open Ocean
// Loops + defining your own functions.

function manageFight() {
  let tension = getTension();
  let stamina = getFishStamina();

  if (stamina < 18) {
    // The fish is worn out now — push through to land it.
    if (getLineOut() <= 3) {
      land();
    } else if (tension > 90) {
      letOut(3);
    } else {
      setDrag(55);
      reelIn(5);
    }
  } else if (tension > 75) {
    letOut(3);
    setDrag(20);
  } else if (stamina > 40) {
    setDrag(45);
    reelIn(5);
  } else {
    setDrag(50);
    reelIn(4);
  }
}

cast();
setHook();

while (!isLanded() && !isDone()) {
  manageFight();
}
`,
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id);
}

export function nextLevel(id) {
  const cur = getLevel(id);
  return LEVELS.find((l) => l.order === cur.order + 1) || null;
}
