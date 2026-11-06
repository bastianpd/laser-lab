import { describe, it, expect } from 'vitest';
import { validateParams, toInternal } from '../src/physics/parameters.js';
import { advance, initialState } from '../src/physics/laserFourLevel.js';
import { defaultParams } from '../src/data/defaultParameters.js';
describe('parameter validation', () => {
  it('accepts defaults', () => expect(validateParams(defaultParams, { enforceRange: true }).valid).toBe(true));
  for (const [k, v] of [['tau32', -1], ['tauSp', 0], ['tau1', -0.1], ['sigma19', -2], ['Ntot18', 0], ['tauC', -1], ['Wp', -0.01], ['gamma', 1.5], ['gamma', 0], ['beta', -1e-6], ['vg', NaN]])
    it(`rejects ${k}=${v}`, () => { expect(validateParams({ ...defaultParams, [k]: v }).valid).toBe(false); expect(() => toInternal({ ...defaultParams, [k]: v })).toThrow(RangeError); });
  it('range enforcement flags out-of-bounds values', () => expect(validateParams({ ...defaultParams, Wp: 1 }, { enforceRange: true }).valid).toBe(false));
  it('engine refuses to integrate invalid parameters', () => expect(() => advance(initialState(), { ...defaultParams, sigma19: -1 }, 1)).toThrow());
  it('converts units (1e-19 cm² and 1e18 cm⁻³)', () => { const P = toInternal(defaultParams); expect(P.sigma).toBeCloseTo(2.8e-19, 25); expect(P.Ntot).toBe(1e18); });
});
