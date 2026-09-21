# Perfect Catch

A browser fishing game where you program your rod and reel with code. Built with
[p5.js](https://p5js.org/) — no build step, no bundler.

Four adventures teach programming concepts by having you write the script that
runs the fight, from casting to landing the fish:

1. **The Quiet Pond** — calling functions procedurally (`cast()`, `reelIn()`, `land()`...)
2. **Whisper Stream** — declaring variables to name and reuse your numbers
3. **The Mighty St. Lawrence** — conditionals, reacting to `getTension()` / `getFishStamina()`
4. **Open Ocean** — loops and defining your own functions, to fight giant fish

Along the way you customize your angler (skin tone, hair, outfit, hat, sunglasses,
accessories, body type), earn money from every catch, and spend it in the Tackle
Box on better rods, reels, and lures.

## Running it locally

Just double-click `index.html`. It's plain HTML/CSS/JS loaded as classic
`<script>` tags (deliberately not ES modules, which browsers refuse to load
over `file://`), so no build step and no local server are required.

If you'd rather serve it over `http://` (e.g. to test from another device
on your network), any static file server works:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`. On Windows, double-click `serve.bat` to
do this and open the page automatically.

## Scripting API

Available inside every adventure's code editor:

- `cast()` — cast your line out
- `setHook()` — set the hook once you get a bite
- `reelIn(amount)` — reel in line (also tires the fish, raises tension)
- `letOut(amount)` — give the fish line (lowers tension)
- `setDrag(percent)` — 0–100, how tightly the reel resists the fish
- `pullRod()` — a hard pump of the rod: big stamina hit, big tension spike
- `land()` — attempt to land the fish once it's close and tired
- `getTension()`, `getFishStamina()`, `getLineOut()`, `getDrag()` — read current state
- `isHooked()`, `isLanded()`, `isDone()` — check the fight's status
- `log(message)` — print to the console panel

## Project layout

```
index.html
css/style.css
js/
  data/        gear, fish, levels, cosmetics catalogs
  engine/      GameState (save/load), Simulation (fight physics), CodeRunner (sandbox)
  entities/    procedurally-drawn angler & fish
  scenes/      menu, character creator, tackle box, level select, fishing
  ui/          shared background renderer
```

No image assets — the angler and every fish are drawn procedurally with p5
primitives, so any cosmetic or species combination just renders.
