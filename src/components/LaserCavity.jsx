import React from 'react';
import { toInternal } from '../physics/laserFourLevel.js';
import { gain, modalGain, lossRate, thresholdPumpRate, pumpRegime } from '../physics/opticalGain.js';
import { photonGlyphCount, phaseAt } from '../physics/visualModel.js';
const tri = (u) => { const m = ((u % 2) + 2) % 2; return m < 1 ? m : 2 - m; }; // bounce between mirrors
// Medium shading ∝ modal gain / loss; photon glyphs ∝ log10 S; output beam only when photons exist; loss arrow ∝ photons × loss.
export default function LaserCavity({ y, params, t = 0 }) {
  const P = toInternal(params), S = y[4], modal = modalGain(P.gamma, gain(P.sigma, (y[1] - y[2]) * P.Ntot)), loss = lossRate(P.vg, P.tauC);
  const n = photonGlyphCount(S), state = pumpRegime(params.Wp, thresholdPumpRate(P)), ratio = Math.max(0, modal / loss), color = { 'below threshold': '#8d97ad', 'at threshold': '#ffd24a', 'above threshold': '#3ddc97' }[state];
  return (<svg viewBox="0 0 520 170" className="diagram" role="img" aria-label="Optical resonator">
    <rect x="40" y="30" width="12" height="80" fill="#9fb3d9" /><rect x="460" y="30" width="12" height="80" fill="#9fb3d9" opacity=".55" />
    <rect x="52" y="50" width="408" height="40" fill={color} opacity={0.08 + 0.4 * Math.min(1, ratio / 2)} />
    {Array.from({ length: n }, (_, i) => <circle key={i} data-kind="photon" cx={60 + 390 * tri(phaseAt(t, i / n) * 2)} cy={70 + (i % 3) * 7 - 7} r="3.5" fill="#ff4d5e" />)}
    {n > 0 && <line data-kind="output" x1="472" y1="70" x2="515" y2="70" stroke="#ff4d5e" strokeWidth={1 + n / 3} />}
    {n > 0 && <line data-kind="loss" x1="466" y1="100" x2="466" y2={100 + Math.min(30, n * 2)} stroke="#8d97ad" strokeWidth="2" />}
    <text x="40" y="22" fill="#c9d4ee" fontSize="11">HR mirror</text><text x="415" y="22" fill="#c9d4ee" fontSize="11">output coupler</text>
    <text x="40" y="132" fill="#c9d4ee" fontSize="12">Γg = {modal.toFixed(4)} cm⁻¹ vs αi+αm = {loss.toFixed(4)} cm⁻¹ (ratio {ratio.toFixed(2)})</text>
    <text x="40" y="152" fill={color} fontSize="13">{state}</text></svg>);
}
