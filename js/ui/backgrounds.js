// Shared procedural environment renderer, reused by the menu and every
// fishing adventure. `theme` comes from js/data/levels.js envTheme.

function drawScene(p, w, h, theme, t) {
  const horizon = h * 0.42;

  // sky
  const skyTop = p.color(theme.sky[0]);
  const skyBot = p.color(theme.sky[1]);
  for (let y = 0; y < horizon; y++) {
    const amt = y / horizon;
    p.stroke(p.lerpColor(skyTop, skyBot, amt));
    p.line(0, y, w, y);
  }
  p.noStroke();

  // sun glow
  p.fill(255, 250, 220, 70);
  p.circle(w * 0.8, horizon * 0.4, 90);

  // water
  const waterTop = p.color(theme.water[0]);
  const waterBot = p.color(theme.water[1]);
  for (let y = horizon; y < h; y++) {
    const amt = (y - horizon) / (h - horizon);
    p.stroke(p.lerpColor(waterTop, waterBot, amt));
    p.line(0, y, w, y);
  }
  p.noStroke();

  // water sparkle / wave lines
  p.stroke(255, 255, 255, 35);
  p.strokeWeight(1.5);
  for (let i = 0; i < 14; i++) {
    const wy = horizon + 12 + i * ((h - horizon - 20) / 14);
    const offset = Math.sin(t * 0.6 + i * 0.7) * 10;
    p.line(0 + offset, wy, w + offset, wy - 4);
  }
  p.noStroke();

  drawDecor(p, w, h, horizon, theme, t);
}

function drawDecor(p, w, h, horizon, theme, t) {
  if (theme.decor === "lilypads") {
    p.fill(60, 120, 70, 200);
    const pads = [[0.15, 0.7], [0.3, 0.85], [0.75, 0.75], [0.6, 0.9], [0.9, 0.68]];
    for (const [px, py] of pads) {
      const x = px * w + Math.sin(t * 0.4 + px * 10) * 4;
      const y = horizon + py * (h - horizon);
      p.ellipse(x, y, 34, 14);
    }
  } else if (theme.decor === "rocks") {
    p.fill(120, 120, 118);
    const rocks = [[0.1, 0.6, 26], [0.25, 0.8, 18], [0.85, 0.65, 30], [0.7, 0.9, 16]];
    for (const [rx, ry, rs] of rocks) {
      const x = rx * w;
      const y = horizon + ry * (h - horizon);
      p.ellipse(x, y, rs, rs * 0.55);
      p.fill(255, 255, 255, 30);
      p.ellipse(x - rs * 0.2, y - rs * 0.15, rs * 0.4, rs * 0.2);
      p.fill(120, 120, 118);
    }
  } else if (theme.decor === "current") {
    p.stroke(255, 255, 255, 25);
    p.strokeWeight(2);
    for (let i = 0; i < 6; i++) {
      const y = horizon + 30 + i * 30;
      const startX = ((t * 40 + i * 90) % (w + 80)) - 80;
      p.line(startX, y, startX + 50, y - 6);
    }
    p.noStroke();
  } else if (theme.decor === "waves") {
    p.stroke(255, 255, 255, 45);
    p.strokeWeight(2);
    for (let i = 0; i < 8; i++) {
      const y = horizon + 16 + i * 20;
      p.beginShape();
      p.noFill();
      for (let x = 0; x <= w; x += 20) {
        p.vertex(x, y + Math.sin(t * 1.4 + x * 0.05 + i) * 5);
      }
      p.endShape();
    }
    p.noStroke();
  }
}
