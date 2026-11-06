// Photon-density equation. S [cm^-3] is the cavity-averaged photon density.
export const photonLifetime = (vg, alphaI, alphaM) => 1 / (vg * (alphaI + alphaM)); // ns, alphas in cm^-1
export const cavityLoss = (P) => 1 / (P.vg * P.tauC);                                // αi+αm [cm^-1]
/** dS/dt = Γ vg σ Ntot (n2-n1) S + βsp Ntot n2/τsp - S/τc   [cm^-3 ns^-1] */
export function photonDerivative(n2, n1, S, P) {
  return P.gamma * P.vg * P.sigma * P.Ntot * (n2 - n1) * S + (P.beta * P.Ntot * n2) / P.tauSp - S / P.tauC;
}
