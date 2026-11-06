import { describe, it, expect } from 'vitest';
import { integrate, safeStep } from '../src/physics/numericalSolver.js';
describe('RK4 solver', () => {
  it('matches exp(-t) with 4th-order error scaling', () => {
    const f = (y) => [-y[0]], err = (dt) => Math.abs(integrate(f, [1], 1, dt).y[0] - Math.exp(-1));
    expect(err(0.1)).toBeLessThan(1e-6); expect(err(0.05) / err(0.1)).toBeLessThan(0.1);
  });
  it('bisects a step that would go negative instead of clipping', () => {
    const f = (y) => [-y[0] * 20, 20 * y[0]];
    const r = safeStep(f, [1, 0], 0.05); expect(r.violation).toBe(false); expect(Math.min(...r.y)).toBeGreaterThanOrEqual(-1e-9);
  });
  it('reports (never hides) a genuine violation', () => {
    const r = safeStep(() => [-10], [0.05], 1, 0, 3); expect(r.violation).toBe(true); expect(r.y[0]).toBeLessThan(0);
  });
});
