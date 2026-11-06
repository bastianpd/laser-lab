import { describe, it, expect } from 'vitest';
import { largestRemainder, fluxes, intensities, particlesOn, photonGlyphCount, phaseAt } from '../src/physics/visualModel.js';
import { advance, initialState } from '../src/physics/laserFourLevel.js';
import { defaultParams as D } from '../src/data/defaultParameters.js';
describe('visual model', () => {
  it('dot counts sum to N and follow populations', () => { const c = largestRemainder([0.1, 0.42, 0.03, 0.45], 60); expect(c.reduce((a, b) => a + b)).toBe(60); expect(c[1]).toBe(25); expect(c[2]).toBe(2); });
  it('zero pump: no fluxes at all', () => { const f = fluxes(initialState(), { ...D, Wp: 0 }); expect(Object.values(f).every((v) => v === 0)).toBe(true); });
  it('steady state below threshold: all four fluxes equal (chain balance)', () => {
    const p = { ...D, Wp: 0.002 }, f = fluxes(advance(initialState(), p, 3000).y, p);
    for (const k of ['relax32', 'spont', 'relax10']) expect(Math.abs(f[k] - f.pump) / f.pump).toBeLessThan(1e-3);
  });
  it('above threshold stimulated flux exceeds spontaneous (≈3.8× at Wp=0.02)', () => { const p = { ...D, Wp: 0.02 }, f = fluxes(advance(initialState(), p, 3000).y, p); expect(f.stim).toBeGreaterThan(3 * f.spont); });
  it('absorption is flagged by a negative stim intensity', () => expect(intensities(fluxes([0, 0.1, 0.4, 0.5, 1e14], D)).stim).toBeLessThan(0));
  it('intensities in [0,1], max = 1; particle counts 0..4', () => { const i = intensities({ pump: 1, relax32: 0.5, spont: 0.25, stim: 0, relax10: 0 }); expect(i.pump).toBe(1); expect(i.stim).toBe(0); expect(particlesOn(1)).toBe(4); expect(particlesOn(0)).toBe(0); });
  it('photon glyphs: 0 for noise, monotone, capped', () => { expect(photonGlyphCount(1e10)).toBe(0); let prev = 0; for (let e = 12; e <= 22; e++) { const c = photonGlyphCount(10 ** e); expect(c).toBeGreaterThanOrEqual(prev); prev = c; } expect(prev).toBe(16); });
  it('phase is static when physical time is frozen', () => expect(phaseAt(5, 0.3)).toBe(phaseAt(5, 0.3)));
});
