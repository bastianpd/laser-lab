import { describe, it, expect } from 'vitest';
import { advance, initialState, toInternal, derivatives } from '../src/physics/laserFourLevel.js';
import { thresholdInversion, thresholdPumpRate } from '../src/physics/opticalGain.js';
import { belowThresholdSteadyState, aboveThresholdSteadyState } from '../src/physics/steadyState.js';
import { stableTimeStep } from '../src/physics/rateEquations.js';
import { defaultParams as D } from '../src/data/defaultParameters.js';
const run = (p, T = 3000, dt = 0.02, y0 = initialState()) => advance(y0, p, T, dt);
const sets = [D, { ...D, Wp: 0.05 }, { ...D, tau32: 0.1, tau1: 0.1, tauC: 0.1, Wp: 0.05, sigma19: 10 }, { ...D, Ntot18: 5, sigma19: 10, tauC: 5, Wp: 0.05 }, { ...D, tauSp: 500, Wp: 0.0005 }];

describe('population conservation & positivity', () => {
  sets.forEach((p, i) => it(`Σn = 1 and n,S ≥ 0 (parameter set ${i})`, () => {
    const r = run(p, 2000); expect(Math.abs(r.y[0] + r.y[1] + r.y[2] + r.y[3] - 1)).toBeLessThan(1e-10);
    expect(Math.min(...r.y)).toBeGreaterThanOrEqual(-1e-9); expect(r.violations).toBe(0);
  }));
  it('rate-equation derivatives of populations sum to zero', () => { const d = derivatives([0.1, 0.2, 0.05, 0.65, 3e15], toInternal(D)); expect(Math.abs(d[0] + d[1] + d[2] + d[3])).toBeLessThan(1e-15); });
});
describe('pump behaviour', () => {
  it('zero pump: everything stays in E0, S stays 0', () => { const { y } = run({ ...D, Wp: 0 }); expect(y[3]).toBe(1); expect(y[4]).toBe(0); });
  it('inversion grows monotonically with pump', () => { let prev = -1; for (const Wp of [0.0005, 0.001, 0.002, 0.003]) { const y = run({ ...D, Wp }).y, dn = y[1] - y[2]; expect(dn).toBeGreaterThan(prev); prev = dn; } });
  it('four-level: arbitrarily small pump already inverts (τsp > τ1)', () => { const y = run({ ...D, Wp: 1e-5 }, 6000).y; expect(y[1] - y[2]).toBeGreaterThan(0); });
});
describe('analytic steady states', () => {
  it('below threshold matches closed form', () => {
    const p = { ...D, Wp: 0.002 }, P = toInternal(p), y = run(p, 3000).y, a = belowThresholdSteadyState(P);
    expect(Math.abs(y[0] - a.n3)).toBeLessThan(1e-4); expect(Math.abs(y[1] - a.n2)).toBeLessThan(1e-4); expect(Math.abs(y[2] - a.n1)).toBeLessThan(1e-4);
  });
  it('threshold pump rate: S=0 inversion equals Δn_th', () => { const P = toInternal(D), a = belowThresholdSteadyState({ ...P, Wp: thresholdPumpRate(P) }); expect(a.n2 - a.n1).toBeCloseTo(thresholdInversion(P), 12); });
  it('above threshold (βsp=0): gain clamps at Δn_th and S matches closed form', () => {
    const p = { ...D, Wp: 0.02, beta: 0 }, P = toInternal(p), a = aboveThresholdSteadyState(P);
    const y = run(p, 8000, 0.02, [0, 0, 0, 1, 1e8]).y;
    expect(Math.abs(y[1] - y[2] - a.deltaN)).toBeLessThan(1e-6); expect(Math.abs(y[4] - a.S) / a.S).toBeLessThan(1e-3);
  });
  it('with realistic βsp the gain is still clamped within 0.1%', () => { const p = { ...D, Wp: 0.02 }, P = toInternal(p), y = run(p, 8000).y; expect(Math.abs((y[1] - y[2]) - thresholdInversion(P)) / thresholdInversion(P)).toBeLessThan(1e-3); });
});
describe('threshold behaviour', () => {
  it('photon density jumps across Wp_th (L-I knee)', () => {
    const Wth = thresholdPumpRate(toInternal(D)), lo = run({ ...D, Wp: 0.8 * Wth }).y[4], hi = run({ ...D, Wp: 1.5 * Wth }).y[4];
    expect(hi / lo).toBeGreaterThan(1e3);
  });
  it('inversion without oscillation: ΔN>0 yet below Δn_th when losses are high', () => {
    const p = { ...D, Wp: 0.004, tauC: 0.1 }, P = toInternal(p), y = run(p).y, dn = y[1] - y[2];
    expect(dn).toBeGreaterThan(0.05); expect(dn).toBeLessThan(thresholdInversion(P)); expect(y[4]).toBeLessThan(1e10);
  });
  it('lower loss (longer τc) lowers the pump threshold', () => expect(thresholdPumpRate(toInternal({ ...D, tauC: 2 }))).toBeLessThan(thresholdPumpRate(toInternal(D))));
});
describe('photon / excitation consistency', () => {
  it('n2 + S/(Γ Ntot) is conserved when spontaneous decay, cavity loss and βsp vanish', () => {
    const p = { ...D, Wp: 0, tauSp: 1e12, tauC: 1e12, beta: 0 }, P = toInternal(p), y0 = [0, 0.5, 0, 0.5, 1e10];
    const inv = (y) => y[1] + y[4] / (P.gamma * P.Ntot), y = run(p, 40, 0.01, y0).y;
    expect(Math.abs(inv(y) - inv(y0))).toBeLessThan(1e-9); expect(y[4] / (P.gamma * P.Ntot)).toBeGreaterThan(0.1);
  });
});
describe('numerical validation', () => {
  it('RK4 order ≈ 4 on the coupled nonlinear system', () => {
    const p = { ...D, Wp: 0.02 }, y0 = [0, 0.3, 0, 0.7, 1e16], ref = run(p, 30, 0.003125, y0).y;
    const e = (dt) => { const y = run(p, 30, dt, y0).y; return Math.max(Math.abs(y[1] - ref[1]), Math.abs(y[4] - ref[4]) / ref[4]); };
    const e1 = e(0.1), e2 = e(0.05), e3 = e(0.025);
    expect(Math.log2(e1 / e2)).toBeGreaterThan(3.5); expect(Math.log2(e2 / e3)).toBeGreaterThan(3.5); expect(e3).toBeLessThan(1e-6);
  });
  it('independent of chunking (frame-rate independence)', () => {
    const p = { ...D, Wp: 0.02 }, one = run(p, 1000).y; let y = initialState(); for (let i = 0; i < 100; i++) y = advance(y, p, 10).y;
    for (let i = 0; i < 5; i++) expect(Math.abs(y[i] - one[i]) / (Math.abs(one[i]) + 1e-30)).toBeLessThan(1e-9);
    let z = initialState(); for (let i = 0; i < 137; i++) z = advance(z, p, 7.3).y; const ref = run(p, 137 * 7.3).y;
    expect(Math.abs(z[1] - ref[1])).toBeLessThan(1e-7);
  });
  it('step cap keeps a requested oversized dt stable and accurate (stiff parameters)', () => {
    const p = { ...sets[2] }, big = run(p, 200, 5).y, ref = run(p, 200, 0.005).y;
    expect(big.every(Number.isFinite)).toBe(true); expect(Math.abs(big[1] - ref[1])).toBeLessThan(1e-4); expect(Math.abs(big[4] - ref[4]) / ref[4]).toBeLessThan(1e-3);
  });
  it('default dt = 0.02 ns is well inside the stability limit', () => expect(0.02).toBeLessThan(0.1 * stableTimeStep(toInternal(D), 1e17)));
  it('stability limit tightens as photon density grows', () => expect(stableTimeStep(toInternal(D), 1e17)).toBeLessThan(stableTimeStep(toInternal(D), 0)));
});
