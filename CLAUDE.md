# Working conventions

- Commit as you go — don't let a session accumulate a huge uncommitted diff.
  Break work into logically complete chunks and commit each once it's in a
  working state, rather than saving everything for one commit at the end.
- Push completed work to `origin/main` automatically once it's committed and
  working — don't wait to be asked. Commit directly to `main`; no feature
  branches or PRs needed for this repo unless asked.
- This is a static, no-build-step site (plain HTML/CSS/ES modules). There is
  no compile step to break — "working" means: loads without console errors,
  and the specific thing you changed behaves correctly in the browser preview.

# Project premise

**Perfect Catch** is a browser game that teaches programming by having the
player write the code that operates a fishing rod and reel, instead of
clicking buttons. Four adventures escalate both the fishing difficulty and
the programming concept required to handle it:

| # | Adventure | Water | New concept | Fish |
|---|---|---|---|---|
| 1 | The Quiet Pond | pond | calling functions procedurally | Sunfish, Bass |
| 2 | Whisper Stream | stream | declaring variables | Trout, Grayling |
| 3 | The Mighty St. Lawrence | river | conditionals | Pike, Muskellunge |
| 4 | Open Ocean | ocean | loops + defining your own functions | Tuna, Marlin, "The Old One" |

Each level's tutorial text and starter code are written so that the *naive*
approach from the previous level (a flat list of calls, hardcoded numbers, a
copy-pasted if/else block) becomes impractical or unsafe, motivating the
next concept without hard-gating it — the game never refuses to run code
that skips a concept, it just tends to fail the fight.

Outside the adventures: full angler customization (skin tone, hair
style/color, outfit style/color, hat, sunglasses, accessory, body type) and
a money/tackle-box economy — catches earn money, money buys better rods,
reels, and lures with real stat differences (line-break tension, reel
efficiency, drag smoothness, line capacity, bite bonus). No image assets —
the angler, every fish, and every background are drawn procedurally with
p5.js primitives, so any cosmetic or species combination just renders.

# Architecture

No build step, no bundler. `index.html` loads p5.js, Acorn, and CodeMirror 5
from cdnjs, then every `js/**/*.js` file as a **classic script** (`<script
src="...">`, no `type="module"`) in dependency order, ending with
`js/main.js`. This is deliberate, matching the convention already used by
this machine's other p5 projects (e.g. `null-island`): `import`/`export` ES
modules refuse to load over a `file://` URL (the browser treats it as a
CORS-blocked opaque origin), so double-clicking `index.html` would show a
blank page. Classic `<script src>` tags don't have that restriction — they
load fine over `file://` — so the game can be opened directly with no local
server. All top-level `const`/`function`/`class` declarations across the
`js/` tree share one global scope instead of module exports; there is
**no import/export anywhere in `js/`** — if you add a new file, add its
`<script>` tag to `index.html` in the right dependency position (see the
list there) rather than reaching for `import`.

```
index.html
css/style.css
js/
  data/        gear.js, fish.js, levels.js, cosmetics.js — static catalogs/config
  engine/
    Game.js        singleton hub: p5 instance ref, SceneManager, DOM refs (#canvas-holder,
                    #side-panel), toast(), setPanel(). A tiny el() helper builds DOM nodes
                    without a templating library.
    GameState.js    save data (money, owned/equipped gear, character, unlocked levels,
                    per-level saved code, stats) + localStorage load/save.
    Simulation.js   the fishing-fight physics: tension, drag, line-out, fish stamina.
                    createSimulation(level, gear, seed) returns { state, api } where `api`
                    is the exact set of functions (cast, reelIn, letOut, setDrag, pullRod,
                    land, getTension, ...) exposed to user code. Every mutating call pushes
                    a replay-ready log entry to state.log.
    CodeRunner.js   sandboxes user code: parses with Acorn, walks the AST to detect which
                    concepts were used (for the UI badges) and to instrument every loop body
                    with an iteration-guard call, then runs it via `new Function(...)`.
                    A FightEndSignal thrown by the simulation (line snapped / timed out) is
                    treated as a normal fight ending, not a bug in the player's code.
  entities/    Angler.js, FishSprite.js — procedural p5 drawing, parameterized by
               character/species config. No canvas state of their own.
  scenes/      Menu, CharacterCreator, TackleBox, LevelSelect, Fishing. Each scene is a
               plain object with enter/exit/draw/mousePressed hooks, registered on
               Game.sm (SceneManager) in main.js. Scenes render their canvas-side visuals
               via p5 in draw(), and build their controls (buttons, swatches, the
               CodeMirror editor, stat bars) as real DOM nodes in #side-panel — canvas is
               for the game world, DOM is for the UI chrome. This split is deliberate;
               don't try to draw forms in p5 or animate the fight in DOM.
  ui/backgrounds.js   shared procedural sky/water/decor renderer, reused by every scene
               that shows an environment (menu uses the pond theme; each adventure uses
               its own envTheme from levels.js).
  main.js      creates the single p5 instance (instance mode, not global — needed because
               ES modules don't expose top-level functions on `window`), registers all
               scenes, boots into "menu".
```

## The fight simulation, in more detail

`Simulation.js` is a deterministic-ish state machine (`idle -> waiting ->
fighting -> landed | snapped | timeout`) driven entirely by synchronous API
calls — there is no real-time loop underneath it. Each call (`reelIn`,
`letOut`, `setDrag`, `pullRod`) mutates `tension`, `lineOut`, and
`fishStamina` by formula, then rolls a seeded-RNG chance (`mulberry32`,
seeded per attempt) for the fish to "run" (yank more line out and spike
tension). `land()` only succeeds once `lineOut <= 2.5` and stamina is below
the level's `landStaminaPct`; otherwise it's a no-op-ish failed attempt with
a small tension penalty, so players can call it speculatively.

`FishingScene` takes the finished `state.log` (built entirely before any
animation happens — the whole script runs to completion synchronously) and
replays it on a timer, advancing HUD bars and appending console lines in
step, independent of how the physics itself was computed. `Skip` just fast
forwards through the remaining log entries.

## Balance notes (read before retuning fish/gear numbers)

Two real bugs were found and fixed via actual browser play-testing (not just
code review) — worth knowing before changing the constants again:

- **`reelIn()`'s efficiency must clearly exceed `letOut()`'s 1:1 rate at
  default drag**, or a script that reacts to tension by alternating
  `letOut`/`reelIn` around a threshold gets stuck in equilibrium with the
  fish pinned at the reel's max line capacity forever (verified: pike stuck
  at `lineOut == lineCapacity` for 100+ actions with tension perfectly
  "controlled" the whole time). `reelIn`'s effective pull is
  `reelEfficiency * (0.85 + drag/220)` for exactly this reason — don't drop
  that `0.85` base much without re-verifying against a threshold-based
  script.
- **Fish "run" frequency/magnitude compounds fast** — `aggression *
  volatility` multiplies two 0–1 numbers that both trend upward across
  levels; the original formula let the ocean's giant fish hit an 80%+ per
  action run chance at full stamina, which sent `lineOut` to capacity
  before the player's code got a single useful action in. The dampened
  formula in `fishReact()` keeps worst-case run chance around 25–30% at full
  health, tapering as the fish tires. If you add a harder fish or level,
  sanity-check the resulting chance/magnitude by hand, don't just extrapolate
  the existing curve.
- When retuning, verify with the browser, not arithmetic alone — write a
  throwaway script with `cm.setValue(...)` via `javascript_tool`, run it,
  `Skip`, then inspect `Game.sm.scenes.fishing.finalState` (dynamic
  `import('/js/engine/Game.js')` gets you the live singleton from outside
  the module graph). Several plausible-looking formulas produced dead-locked
  fights that pure math wouldn't have caught.
