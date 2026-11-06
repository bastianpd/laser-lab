// Population rate equations for the four-level system, in normalized form (n_i = N_i/Ntot).
// stim = vg*sigma*(n2-n1)*S [1/ns]  == spec's vg σ (N2-N1) S divided by Ntot. Negative when n1>n2 (absorption).
export const stimulatedRate = (P, n2, n1, S) => P.vg * P.sigma * (n2 - n1) * S;
/** d/dt of [n3, n2, n1, n0]. The four derivatives sum to exactly zero (population conservation). */
export function populationDerivatives([n3, n2, n1, n0], P, S) {
  const stim = stimulatedRate(P, n2, n1, S);
  return [
    P.Wp * n0 - n3 / P.tau32,
    n3 / P.tau32 - n2 / P.tauSp - stim,
    n2 / P.tauSp + stim - n1 / P.tau1,
    -P.Wp * n0 + n1 / P.tau1,
  ];
}
/** Conservative RK4 step-size limit (2.78/|λmax| with a Gershgorin-style bound on the fastest rate). */
export function stableTimeStep(P, S = 0) {
  const lam = Math.max(1 / P.tau32, 1 / P.tauSp, 1 / P.tau1, 1 / P.tauC) + P.Wp + 2 * P.vg * P.sigma * S + P.gamma * P.vg * P.sigma * P.Ntot;
  return 2.78 / lam;
}
