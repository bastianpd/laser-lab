import { thresholdInversion, thresholdPumpRate } from './opticalGain.js';
/** Analytic steady state with S ≈ 0 (valid below threshold). */
export function belowThresholdSteadyState(P) {
  const n0 = 1 / (1 + P.Wp * (P.tau32 + P.tauSp + P.tau1));
  return { n0, n3: P.Wp * n0 * P.tau32, n2: P.Wp * n0 * P.tauSp, n1: P.Wp * n0 * P.tau1 };
}
/** Analytic steady state above threshold with βsp = 0: gain clamping Δn = Δn_th. Returns null below threshold. */
export function aboveThresholdSteadyState(P) {
  if (!(P.Wp > thresholdPumpRate(P))) return null;
  const d = thresholdInversion(P), n0 = (1 - d) / (1 + P.Wp * (P.tau32 + 2 * P.tau1));
  const n1 = P.tau1 * P.Wp * n0, n2 = n1 + d, R = P.Wp * n0 - n2 / P.tauSp;
  return { n0, n3: P.tau32 * P.Wp * n0, n2, n1, S: R / (P.vg * P.sigma * d), deltaN: d };
}
