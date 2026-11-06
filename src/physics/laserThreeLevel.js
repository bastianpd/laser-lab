// Three-level laser: level 1 = ground AND lower laser level, 2 = metastable upper laser level, 3 = pump level.
// Same units/normalization as the four-level model; state [n3, n2, n1, S]; n1+n2+n3 = 1.
import { safeStep } from './numericalSolver.js';
import { stableTimeStep } from './rateEquations.js';
import { photonDerivative } from './photonDynamics.js';
import { toInternal } from './parameters.js';
import { thresholdInversion } from './opticalGain.js';
export const initialState3 = () => [0, 0, 1, 0];
export function derivatives3([n3, n2, n1, S], P) {
  const stim = P.vg * P.sigma * (n2 - n1) * S;
  return [P.Wp * n1 - n3 / P.tau32, n3 / P.tau32 - n2 / P.tauSp - stim, -P.Wp * n1 + n2 / P.tauSp + stim, photonDerivative(n2, n1, S, P)];
}
export function advance3(y, params, dtTotal, dt = 0.02) {
  const P = toInternal(params), f = (v) => derivatives3(v, P), Q = { ...P, tau1: Infinity };
  let s = y, t = 0, violations = 0;
  while (t < dtTotal - 1e-12) { const h = Math.min(dt, 0.5 * stableTimeStep(Q, s[3]), dtTotal - t); const r = safeStep(f, s, h); s = r.y; violations += r.violation ? 1 : 0; t += h; }
  return { y: s, violations };
}
/** S=0 steady state: n1 = 1/(1+Wp(τ32+τsp)), n2 = Wp τsp n1  ⇒ inversion (n2>n1) needs Wp > 1/τsp. */
export const inversionPumpRate3 = (P) => 1 / P.tauSp;
/** Wp where steady-state Δn = Δn_th: Wp = (1+Δn_th)/(τsp − Δn_th(τ32+τsp)). */
export function thresholdPumpRate3(P) { const d = thresholdInversion(P), den = P.tauSp - d * (P.tau32 + P.tauSp); return den > 0 ? (1 + d) / den : Infinity; }
