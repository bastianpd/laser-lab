import { describe, it, expect } from 'vitest';
import { advance3, initialState3, inversionPumpRate3, thresholdPumpRate3 } from '../src/physics/laserThreeLevel.js';
import { advance, initialState, toInternal } from '../src/physics/laserFourLevel.js';
import { thresholdPumpRate, thresholdInversion } from '../src/physics/opticalGain.js';
import { defaultParams as D } from '../src/data/defaultParameters.js';
const run3 = (p, T = 4000) => advance3(initialState3(), p, T);
describe('three-level model', () => {
  it('conserves population, stays non-negative', () => { for (const Wp of [0.005, 0.02, 0.05]) { const r = run3({ ...D, Wp }); expect(Math.abs(r.y[0] + r.y[1] + r.y[2] - 1)).toBeLessThan(1e-10); expect(Math.min(...r.y)).toBeGreaterThanOrEqual(-1e-9); expect(r.violations).toBe(0); } });
  it('no inversion below Wp = 1/τsp, inversion above', () => { const P = toInternal(D), w = inversionPumpRate3(P); const lo = run3({ ...D, Wp: 0.5 * w }).y, hi = run3({ ...D, Wp: 1.5 * w }).y; expect(lo[1] - lo[2]).toBeLessThan(0); expect(hi[1] - hi[2]).toBeGreaterThan(0); });
  it('same weak pump inverts the four-level but not the three-level system', () => { const p = { ...D, Wp: 0.005 }, y4 = advance(initialState(), p, 4000).y, y3 = run3(p).y; expect(y4[1] - y4[2]).toBeGreaterThan(0); expect(y3[1] - y3[2]).toBeLessThan(0); });
  it('threshold pump is higher than four-level and matches the analytic inversion', () => {
    const P = toInternal(D), W3 = thresholdPumpRate3(P); expect(W3).toBeGreaterThan(3 * thresholdPumpRate(P));
    const n1 = 1 / (1 + W3 * (P.tau32 + P.tauSp)); expect(n1 * (W3 * P.tauSp - 1)).toBeCloseTo(thresholdInversion(P), 10);
  });
  it('lases above its own threshold only', () => { const W3 = thresholdPumpRate3(toInternal(D)); expect(run3({ ...D, Wp: 1.5 * W3 }, 8000).y[3] / run3({ ...D, Wp: 0.8 * W3 }, 8000).y[3]).toBeGreaterThan(1e3); });
});
