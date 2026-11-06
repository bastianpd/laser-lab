import { PARAM_SPEC, SIM_SPEC } from '../physics/parameters.js';
// Illustrative parameters: Nd:YAG-like sigma; lifetimes compressed (real τsp is ~230 µs) so dynamics are visible.
export const defaultParams = { Wp: 0.01, tau32: 1, tauSp: 100, tau1: 1, sigma19: 2.8, Ntot18: 1, tauC: 1, gamma: 0.8, beta: 1e-5, vg: 16.5 };
export const defaultSimulation = { duration: 2000, dt: 0.02 };
export { SIM_SPEC };
// Slider table used by the UI: key -> [min, max, step, unit, description]
export const limits = Object.fromEntries(Object.entries(PARAM_SPEC).filter(([, s]) => s.ui).map(([k, s]) => [k, [s.min, s.max, s.step, s.unit, s.desc]]));
