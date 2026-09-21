// Procedurally draws a fish. angle in radians (0 = swimming right).
function drawFish(p, x, y, angle, sizeScale, species, opts = {}) {
  if (!species) return;
  const giant = !!species.giant;
  const base = (giant ? 26 : 16) * sizeScale;
  const t = opts.wiggle ?? 0;

  p.push();
  p.translate(x, y);
  p.rotate(angle);

  const bend = Math.sin(t * 6) * 0.18;

  // tail
  p.fill(species.finColor);
  p.push();
  p.translate(-base * 1.05, 0);
  p.rotate(bend);
  p.triangle(0, 0, -base * 0.7, -base * 0.5, -base * 0.7, base * 0.5);
  p.pop();

  // body
  p.fill(species.bodyColor);
  p.ellipse(0, 0, base * 2.1, base * 1.05);

  // belly highlight
  p.fill(255, 255, 255, 60);
  p.ellipse(base * 0.1, base * 0.22, base * 1.6, base * 0.4);

  // dorsal fin
  p.fill(species.finColor);
  p.triangle(-base * 0.2, -base * 0.45, base * 0.15, -base * 0.9, base * 0.4, -base * 0.4);

  // eye
  p.fill(255);
  p.circle(base * 0.75, -base * 0.08, base * 0.28);
  p.fill(15, 15, 20);
  p.circle(base * 0.8, -base * 0.08, base * 0.13);

  // mouth
  p.stroke(0, 0, 0, 90);
  p.strokeWeight(Math.max(1, base * 0.05));
  p.noFill();
  p.arc(base * 1.02, base * 0.05, base * 0.35, base * 0.3, 0.2, 1.4);
  p.noStroke();

  p.pop();
}
