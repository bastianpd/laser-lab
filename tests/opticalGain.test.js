import { describe, it, expect } from 'vitest';
import { gain, modalGain, lossRate, thresholdInversion, thresholdGain, thresholdPumpRate, regime, inversion, pumpRegime } from '../src/physics/opticalGain.js';
import { photonLifetime } from '../src/physics/photonDynamics.js';
import { toInternal } from '../src/physics/laserFourLevel.js';
import { defaultParams } from '../src/data/defaultParameters.js';
const P = toInternal(defaultParams);
describe('inversion, gain, threshold', () => {
  it('ΔN sign', () => { expect(inversion(0.3, 0.1)).toBeCloseTo(0.2, 12); expect(inversion(0.1, 0.3)).toBeLessThan(0); });
  it('g = σΔN: positive, zero, negative (absorption)', () => { expect(gain(2.8e-19, 1e17)).toBeCloseTo(0.028, 12); expect(gain(2.8e-19, 0)).toBe(0); expect(gain(2.8e-19, -1e17)).toBeLessThan(0); });
  it('modal gain scales with Γ', () => expect(modalGain(0.5, 0.04)).toBeCloseTo(0.02, 14));
  it('Γ g_th = αi+αm = 1/(vg τc)', () => expect(P.gamma * thresholdGain(P)).toBeCloseTo(lossRate(P.vg, P.tauC), 12));
  it('modal gain equals loss exactly at Δn_th', () => expect(modalGain(P.gamma, gain(P.sigma, thresholdInversion(P) * P.Ntot))).toBeCloseTo(lossRate(P.vg, P.tauC), 12));
  it('higher losses (shorter τc) raise threshold inversion', () => expect(thresholdInversion({ ...P, tauC: 0.5 })).toBeGreaterThan(thresholdInversion(P)));
  it('τc = 1/(vg(αi+αm))', () => expect(photonLifetime(P.vg, 0.02, 0.04)).toBeCloseTo(1 / (16.5 * 0.06), 12));
  it('threshold can be unreachable (Δn_th ≥ 1)', () => expect(thresholdPumpRate({ ...P, tauC: 0.05 })).toBe(Infinity));
  it('pump regime labels', () => { expect(pumpRegime(0.5, 1)).toBe('below threshold'); expect(pumpRegime(1.01, 1)).toBe('at threshold'); expect(pumpRegime(1.5, 1)).toBe('above threshold'); expect(pumpRegime(1, Infinity)).toBe('below threshold'); });
  it('regime labels', () => { expect(regime(0.5, 1)).toBe('below threshold'); expect(regime(1, 1)).toBe('at threshold'); expect(regime(2, 1)).toBe('above threshold'); });
});
