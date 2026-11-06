export const inversion = (n2, n1) => n2 - n1;                                  // normalized ΔN/Ntot
export const gain = (sigmaCm2, dN) => sigmaCm2 * dN;                           // g = σ ΔN [cm^-1], dN in cm^-3
export const modalGain = (gamma, g) => gamma * g;                              // Γ g
export const lossRate = (vg, tauC) => 1 / (vg * tauC);                         // αi+αm [cm^-1]
/** Threshold inversion fraction: Γ σ Ntot Δn_th = 1/(vg τc). Needs internal params (sigma, Ntot). */
export const thresholdInversion = (P) => 1 / (P.gamma * P.vg * P.sigma * P.Ntot * P.tauC);
export const thresholdGain = (P) => 1 / (P.gamma * P.vg * P.tauC);             // g_th = (αi+αm)/Γ [cm^-1]
/** Pump rate at which the S=0 steady-state inversion reaches Δn_th (Infinity if unreachable). */
export function thresholdPumpRate(P) {
  const d = thresholdInversion(P), den = (P.tauSp - P.tau1) - d * (P.tau32 + P.tauSp + P.tau1);
  return den > 0 ? d / den : Infinity;
}
/** Operating regime by pump rate vs threshold pump (gain clamps to the loss above threshold, so gain alone cannot tell). */
export const pumpRegime = (Wp, Wth, tol = 0.02) => (Wp > Wth * (1 + tol) ? 'above threshold' : Wp >= Wth * (1 - tol) ? 'at threshold' : 'below threshold');
export const regime = (modal, loss, tol = 0.02) =>
  Math.abs(modal - loss) <= tol * loss ? 'at threshold' : modal > loss ? 'above threshold' : 'below threshold';
