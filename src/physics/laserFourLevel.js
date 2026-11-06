import { safeStep } from './numericalSolver.js';
import { populationDerivatives, stableTimeStep } from './rateEquations.js';
import { photonDerivative } from './photonDynamics.js';
import { toInternal } from './parameters.js';
export { toInternal };
/** State vector: [n3, n2, n1, n0, S]. Thermal equilibrium: every atom in E0, no photons. */
export const initialState = () => [0, 0, 0, 1, 0];
export function derivatives(y, P) {
  const [n3, n2, n1, n0, S] = y;
  return [...populationDerivatives([n3, n2, n1, n0], P, S), photonDerivative(n2, n1, S, P)];
}
/** Advance by dtTotal (ns) in fixed RK4 sub-steps of at most dt. The sub-step is also capped at half the
 *  stability limit for the current state, so changing parameters mid-run cannot destabilise the integration.
 *  Independent of browser frame rate. Returns {y, violations}. */
export function advance(y, params, dtTotal, dt = 0.02) {
  const P = toInternal(params), f = (v) => derivatives(v, P);
  let s = y, t = 0, violations = 0;
  while (t < dtTotal - 1e-12) {
    const h = Math.min(dt, 0.5 * stableTimeStep(P, s[4]), dtTotal - t);
    const r = safeStep(f, s, h); s = r.y; violations += r.violation ? 1 : 0; t += h;
  }
  return { y: s, violations };
}
