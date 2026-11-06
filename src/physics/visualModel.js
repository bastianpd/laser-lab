// Pure mapping physics state -> drawing quantities (no React). Every animated element is derived here.
import { toInternal } from './laserFourLevel.js';
/** Integer dot counts summing exactly to N, proportional to fractions (largest-remainder rounding). */
export function largestRemainder(fracs, N) {
  const raw = fracs.map((f) => Math.max(0, f) * N), base = raw.map(Math.floor);
  let rem = N - base.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - base[i], i]).sort((a, b) => b[0] - a[0]).slice(0, rem).forEach(([, i]) => base[i]++);
  return base;
}
/** Transition fluxes [fraction of atoms per ns]; stim < 0 means net absorption (n1 > n2). */
export function fluxes(y, params) {
  const P = toInternal(params), [n3, n2, n1, n0, S] = y;
  return { pump: P.Wp * n0, relax32: n3 / P.tau32, spont: n2 / P.tauSp, stim: P.vg * P.sigma * (n2 - n1) * S, relax10: n1 / P.tau1 };
}
/** Relative intensity 0..1 (sqrt of flux / largest flux); stim keeps its sign. */
export function intensities(fl) {
  const m = Math.max(1e-30, ...Object.values(fl).map(Math.abs));
  return Object.fromEntries(Object.entries(fl).map(([k, v]) => [k, k === 'stim' ? Math.sign(v) * Math.sqrt(Math.abs(v) / m) : Math.sqrt(Math.max(0, v) / m)]));
}
export const particlesOn = (i) => Math.round(Math.abs(i) * 4); // moving particles drawn on an arrow (0..4)
/** Photon glyphs in the cavity: logarithmic display scale, 0 below S = 1e12 cm^-3 (spontaneous noise), max 16. */
export const photonGlyphCount = (S) => (S < 1e12 ? 0 : Math.min(16, Math.ceil(2 * (Math.log10(S) - 11.99))));
/** Position along a path 0..1 advanced by physical time t (ns): motion stops when the simulation is paused. */
export const phaseAt = (t, k, rate = 0.02) => (((t * rate + k) % 1) + 1) % 1;
