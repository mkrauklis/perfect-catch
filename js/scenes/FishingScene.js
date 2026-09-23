
const CONCEPT_BADGES = [
  { key: "variables", label: "Variables" },
  { key: "conditionals", label: "Conditionals" },
  { key: "loops", label: "Loops" },
  { key: "functions", label: "Your Own Functions" },
];

function outcomeFromPhase(phase) {
  if (phase === "landed") return "success";
  return "fail";
}

function failCaption(phase) {
  if (phase === "snapped") return "The line snapped! Try a gentler drag, or let out line when tension climbs.";
  if (phase === "timeout") return "The fish got away — too many actions without landing it.";
  return "Your script finished without landing the fish. Call land() once it's tired (low stamina) and close (low line out).";
}

const FishingScene = {
  enter(Game, payload) {
    this.Game = Game;
    this.level = getLevel(payload.levelId);
    this.rod = getGearById(RODS, Game.state.data.equipped.rod);
    this.reel = getGearById(REELS, Game.state.data.equipped.reel);
    this.log = [];
    this.replayIndex = 0;
    this.playing = false;
    this.finalState = null;
    this.runResult = null;
    this.stepMs = 300;
    this.lastStepAt = 0;
    this.currentSnapshot = { tension: 0, drag: 25, lineOut: 0, fishStaminaPct: 100, phase: "idle" };
    this.currentFishSpecies = null;
    this.wiggle = 0;
    this.castAnim = null;
    this.castAnimDuration = 550;

    this.buildPanel(Game);
  },

  exit() {
    this.cm = null;
  },

  buildPanel(Game) {
    const level = this.level;
    const savedCode = Game.state.getSavedCode(level.id, level.starterCode);

    const tutorial = el("div", { class: "tutorial-box" }, [
      el("strong", {}, level.name + " — " + level.conceptLabel),
      el("p", { html: level.tutorial.intro }),
      el("ul", { style: "margin:6px 0 0 18px;padding:0" }, level.tutorial.points.map((pt) => el("li", { html: pt, style: "margin-bottom:3px" }))),
    ]);

    const editorHolder = el("div", { id: "editor-wrap" });
    const consoleOut = el("div", { id: "console-out" }, "Ready. Click Run to fish.");
    const badgeRow = el(
      "div",
      { class: "concept-badges" },
      CONCEPT_BADGES.map((b) => el("span", { class: "concept-badge", "data-badge": b.key }, b.label))
    );

    const tensionBar = el("div", { class: "stat-bar tension" }, el("div", { style: "width:0%" }));
    const staminaBar = el("div", { class: "stat-bar stamina" }, el("div", { style: "width:100%" }));

    const runBtn = el("button", { class: "btn", onclick: () => this.runScript() }, "▶ Run");
    const skipBtn = el("button", { class: "btn secondary", onclick: () => this.skipAnimation() }, "Skip");
    const resetBtn = el("button", { class: "btn secondary", onclick: () => this.resetCode() }, "Reset Code");

    this.resultBox = el("div", { style: "display:none" });

    const panel = [
      el("h2", {}, level.name),
      tutorial,
      el("h3", {}, "Your Code"),
      editorHolder,
      el("div", { class: "btn-row" }, [runBtn, skipBtn, resetBtn]),
      el("h3", {}, "Console"),
      consoleOut,
      el("h3", {}, "Fight Status"),
      el("div", { class: "stat-bar-label" }, [el("span", {}, "Tension"), el("span", { id: "tension-val" }, "0")]),
      tensionBar,
      el("div", { class: "stat-bar-label" }, [el("span", {}, "Fish Stamina"), el("span", { id: "stamina-val" }, "100")]),
      staminaBar,
      el("h3", {}, "Concepts Used"),
      badgeRow,
      this.resultBox,
    ];
    Game.setPanel(panel);

    this.consoleOut = consoleOut;
    this.tensionBarInner = tensionBar.querySelector("div");
    this.staminaBarInner = staminaBar.querySelector("div");
    this.runBtn = runBtn;
    this.badgeRow = badgeRow;

    this.cm = window.CodeMirror(editorHolder, {
      value: savedCode,
      mode: "javascript",
      theme: "dracula",
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      viewportMargin: Infinity,
    });
  },

  resetCode() {
    this.cm.setValue(this.level.starterCode);
  },

  logLine(text, cls) {
    const line = el("div", { class: cls || "" }, text);
    this.consoleOut.appendChild(line);
    this.consoleOut.scrollTop = this.consoleOut.scrollHeight;
  },

  runScript() {
    if (this.playing) return;
    const Game = this.Game;
    const code = this.cm.getValue();
    Game.state.saveCode(this.level.id, code);

    const seed = Game.state.nextAttemptSeed();
    const sim = createSimulation({ level: this.level, equipped: Game.state.data.equipped, seed });
    const result = runCode(code, sim.api);

    this.log = sim.state.log;
    this.finalState = sim.state;
    this.runResult = result;
    this.replayIndex = 0;
    this.playing = this.log.length > 0;
    this.stepMs = Math.max(50, Math.min(500, 4000 / Math.max(1, this.log.length)));
    this.lastStepAt = performance.now();
    this.currentFishSpecies = sim.state.fish;
    this.wiggle = 0;
    this.castAnim = null;

    this.consoleOut.innerHTML = "";
    this.resultBox.style.display = "none";
    this.resultBox.innerHTML = "";
    this.runBtn.disabled = true;

    for (const b of this.badgeRow.children) b.classList.remove("hit");
    if (result.concepts) {
      for (const b of this.badgeRow.children) {
        if (result.concepts[b.dataset.badge]) b.classList.add("hit");
      }
    }

    if (!result.ok && result.endedBy === "syntax") {
      this.logLine("⚠ " + result.error, "err");
      this.playing = false;
      this.runBtn.disabled = false;
      this.showResult("error", result.error);
    } else if (this.log.length === 0) {
      this.logLine("Your script ran but never called cast(). Nothing happened.", "sys");
      this.runBtn.disabled = false;
      this.showResult("error", "No actions were taken — try calling cast() to begin.");
    }
  },

  skipAnimation() {
    if (!this.playing) return;
    this.castAnim = null;
    while (this.replayIndex < this.log.length) this.advanceStep();
    this.finishPlayback();
  },

  advanceStep() {
    const entry = this.log[this.replayIndex];
    this.replayIndex++;
    this.currentSnapshot = entry.snapshot;
    this.wiggle += 1;
    if (entry.type === "cast") {
      this.castAnim = { start: performance.now() };
    }
    const cls = entry.type === "snap" || entry.type === "timeout" ? "err" : entry.type === "user_log" ? "sys" : "";
    this.logLine(entry.caption || entry.type, cls);
    if (this.tensionBarInner) {
      this.tensionBarInner.style.width = Math.min(100, entry.snapshot.tension) + "%";
      document.getElementById("tension-val").textContent = entry.snapshot.tension;
    }
    if (this.staminaBarInner) {
      this.staminaBarInner.style.width = entry.snapshot.fishStaminaPct + "%";
      document.getElementById("stamina-val").textContent = entry.snapshot.fishStaminaPct;
    }
  },

  finishPlayback() {
    this.playing = false;
    this.runBtn.disabled = false;
    if (!this.runResult.ok && this.runResult.endedBy === "error") {
      this.logLine("⚠ " + this.runResult.error, "err");
      this.showResult("error", this.runResult.error);
      return;
    }
    const phase = this.finalState.phase;
    const outcome = outcomeFromPhase(phase);
    if (outcome === "success") {
      const fish = this.finalState.fish;
      const payout = this.finalState.payout;
      this.Game.state.recordCatch(this.level.id, fish, payout);
      this.Game.updateMoney();
      const nl = nextLevel(this.level.id);
      if (nl) this.Game.state.unlockLevel(nl.id);
      this.showResult("success", `You landed a ${fish.name} (${fish.weight}kg)! +$${payout}`, nl);
    } else {
      if (phase === "snapped") this.Game.state.recordSnap();
      this.showResult("fail", failCaption(phase));
    }
  },

  showResult(kind, message, nl) {
    const box = this.resultBox;
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.gap = "8px";
    box.innerHTML = "";
    box.appendChild(el("div", { class: "result-banner " + (kind === "success" ? "success" : "fail") }, message));
    const btns = [el("button", { class: "btn secondary", onclick: () => this.runScript() }, "Try Again")];
    if (kind === "success" && nl) {
      btns.push(el("button", { class: "btn", onclick: () => this.Game.sm.goto("fishing", { levelId: nl.id }) }, `Next: ${nl.name}`));
    }
    btns.push(el("button", { class: "btn secondary", onclick: () => this.Game.sm.goto("levels") }, "Back to Adventures"));
    box.appendChild(el("div", { class: "btn-row" }, btns));
  },

  draw(Game, p) {
    drawScene(p, CANVAS_W, CANVAS_H, this.level.envTheme, p.frameCount / 60);

    let castProgress = null;
    if (this.castAnim) {
      const elapsed = performance.now() - this.castAnim.start;
      if (elapsed >= this.castAnimDuration) {
        this.castAnim = null;
        this.lastStepAt = performance.now();
      } else {
        castProgress = elapsed / this.castAnimDuration;
      }
    }

    if (this.playing && !this.castAnim && performance.now() - this.lastStepAt >= this.stepMs) {
      this.lastStepAt = performance.now();
      this.advanceStep();
      if (this.replayIndex >= this.log.length) this.finishPlayback();
    }

    const snap = this.currentSnapshot;
    const anglerX = CANVAS_W * 0.22;
    const anglerY = CANVAS_H * 0.56;
    const anglerScale = 3.0;

    // dock: planked deck (right at the angler's feet) + support posts
    // standing down in the water below it
    const feetY = anglerY + 56 * anglerScale;
    const deckH = 16;
    const deckTopY = feetY - 6;
    const waterY = feetY + 12;
    const deckW = 210;
    const deckX = anglerX - 90;
    p.noStroke();
    p.fill(40, 32, 22);
    for (const px of [deckX + 14, deckX + deckW * 0.45, deckX + deckW - 14]) {
      p.rect(px - 5, deckTopY + deckH - 4, 10, CANVAS_H - (deckTopY + deckH - 4), 2);
    }
    p.fill(96, 72, 46);
    p.rect(deckX, deckTopY, deckW, deckH, 3);
    p.stroke(60, 44, 28);
    p.strokeWeight(1.5);
    for (let i = 1; i < 8; i++) {
      const lx = deckX + (deckW / 8) * i;
      p.line(lx, deckTopY + 1, lx, deckTopY + deckH - 1);
    }
    p.noStroke();

    const tensionPct = this.rod ? Math.min(1, snap.tension / this.rod.tensionBreak) : 0;
    const bendDeg = tensionPct * 60;
    const castSwingDeg = castProgress !== null ? -30 * (1 - castProgress) : 0;

    const c = Game.state.data.character;
    const rodTip = drawAngler(p, anglerX, anglerY, anglerScale, c, {
      facing: 1,
      rodBendDeg: bendDeg,
      castSwingDeg,
      rodColor: this.rod ? this.rod.color : undefined,
      reelColor: this.reel ? this.reel.color : undefined,
    });

    // fish position from lineOut
    const maxRef = this.level.castDistanceRange[1] * 1.2;
    const distNorm = Math.max(0, Math.min(1, snap.lineOut / maxRef));
    let fishX = anglerX + 50 + distNorm * (CANVAS_W - anglerX - 110);
    let fishY = waterY + Math.sin(this.wiggle * 0.6) * 6;

    if (castProgress !== null) {
      const t = castProgress;
      fishX = p.lerp(rodTip.x, fishX, t);
      fishY = p.lerp(rodTip.y, fishY, t) - Math.sin(t * Math.PI) * 40;
    }

    // fishing line
    p.stroke(255, 255, 255, 210);
    p.strokeWeight(1.5);
    if (snap.phase === "fighting" || snap.phase === "waiting") {
      p.line(rodTip.x, rodTip.y, fishX, fishY);
    }
    p.noStroke();

    if (castProgress !== null) {
      p.fill(224, 169, 64);
      p.circle(fishX, fishY, 8);
    } else if (snap.phase === "fighting" || snap.phase === "landed") {
      drawFish(p, fishX, fishY, Math.PI, 1.0 + tensionPct * 0.3, this.currentFishSpecies, { wiggle: this.wiggle });
    } else if (snap.phase === "waiting") {
      p.fill(224, 169, 64);
      p.circle(fishX, fishY, 10);
    }

    if (snap.phase === "snapped") {
      p.fill(255, 220, 200);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(22);
      p.text("SNAP!", CANVAS_W / 2, CANVAS_H * 0.3);
    }

    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(13);
    p.text(this.level.name, 16, 16);
  },
};
