
const CANVAS_W = 760;
const CANVAS_H = 560;

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

class SceneManager {
  constructor() {
    this.scenes = {};
    this.current = null;
  }
  register(key, scene) {
    this.scenes[key] = scene;
  }
  goto(key, payload) {
    const prev = this.current ? this.scenes[this.current] : null;
    if (prev && prev.exit) prev.exit(Game);
    this.current = key;
    Game.sidePanel.innerHTML = "";
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.scene === key));
    const next = this.scenes[key];
    if (next && next.enter) next.enter(Game, payload);
  }
  draw(p) {
    const s = this.current ? this.scenes[this.current] : null;
    if (s && s.draw) s.draw(Game, p);
  }
  mousePressed(p) {
    const s = this.current ? this.scenes[this.current] : null;
    if (s && s.mousePressed) s.mousePressed(Game, p);
  }
}

const Game = {
  p: null,
  sm: new SceneManager(),
  state: gameState,
  canvasHolder: null,
  sidePanel: null,
  toastRoot: null,

  init() {
    this.canvasHolder = document.getElementById("canvas-holder");
    this.sidePanel = document.getElementById("side-panel");
    this.toastRoot = document.getElementById("toast-root");
    this.updateMoney();
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.sm.goto(btn.dataset.scene));
    });
  },

  updateMoney() {
    document.getElementById("money-amount").textContent = this.state.money;
  },

  toast(message) {
    const t = el("div", { class: "toast" }, message);
    this.toastRoot.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  },

  setPanel(nodeOrNodes) {
    this.sidePanel.innerHTML = "";
    for (const n of [].concat(nodeOrNodes)) this.sidePanel.appendChild(n);
  },
};
