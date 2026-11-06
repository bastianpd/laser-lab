// Independent RK4 integrator (no React). State is a plain array.
export function rk4Step(f, y, dt) {
  const add = (a, b, h) => a.map((v, i) => v + h * b[i]);
  const k1 = f(y), k2 = f(add(y, k1, dt / 2)), k3 = f(add(y, k2, dt / 2)), k4 = f(add(y, k3, dt));
  return y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
const NEG_TOL = 1e-9;
/** One step of size dt; if the result is unphysical (negative beyond tolerance)
 *  the step is bisected recursively instead of clipping. Returns {y, bisections, violation}. */
export function safeStep(f, y, dt, depth = 0, maxDepth = 8) {
  const out = rk4Step(f, y, dt);
  if (out.every((v) => v >= -NEG_TOL)) return { y: out, bisections: depth > 0 ? 1 : 0, violation: false };
  if (depth >= maxDepth) return { y: out, bisections: 0, violation: true }; // reported, never silently hidden
  const a = safeStep(f, y, dt / 2, depth + 1, maxDepth), b = safeStep(f, a.y, dt / 2, depth + 1, maxDepth);
  return { y: b.y, bisections: 1 + a.bisections + b.bisections, violation: a.violation || b.violation };
}
export function integrate(f, y0, tEnd, dt) {
  let y = y0, t = 0, violations = 0;
  while (t < tEnd - 1e-12) { const h = Math.min(dt, tEnd - t); const r = safeStep(f, y, h); y = r.y; violations += r.violation ? 1 : 0; t += h; }
  return { y, violations };
}
