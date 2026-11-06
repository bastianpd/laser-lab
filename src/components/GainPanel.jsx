import React, { useState } from 'react';
import ParameterControls from './ParameterControls.jsx';
import { toInternal } from '../physics/laserFourLevel.js';
import { gain, modalGain, lossRate, thresholdInversion } from '../physics/opticalGain.js';
// Module E: g = σ·ΔN and Γg versus the inversion fraction ΔN/N_total, against the cavity loss αi+αm.
export default function GainPanel({ p, setP }) {
  const [dn, setDn] = useState(0.3), P = toInternal(p), loss = lossRate(P.vg, P.tauC), nth = thresholdInversion(P);
  const modalAt = (x) => modalGain(P.gamma, gain(P.sigma, x * P.Ntot)), g = gain(P.sigma, dn * P.Ntot), modal = modalAt(dn);
  const xs = Array.from({ length: 31 }, (_, i) => -0.5 + i * 0.05), lo = modalAt(-0.5), hi = modalAt(1), W = 360, H = 170;
  const X = (x) => 30 + ((x + 0.5) / 1.5) * (W - 40), Y = (v) => H - 20 - ((v - lo) / (hi - lo)) * (H - 36);
  const kind = dn > 0 ? 'positive gain: amplification' : dn === 0 ? 'zero gain: transparency' : 'negative gain: absorption';
  return (<div className="grid"><section><h2>Optical gain g = σ·ΔN</h2>
    <label className="row">Population inversion ΔN/N_total = {dn.toFixed(2)}<input type="range" aria-label="Population inversion ΔN/N" min="-0.5" max="1" step="0.01" value={dn} onChange={(e) => setDn(+e.target.value)} /></label>
    <ParameterControls p={p} setP={setP} keys={['sigma19', 'gamma', 'Ntot18', 'tauC']} />
    <dl><dt>Gain g</dt><dd data-testid="gain">{g.toFixed(4)} cm⁻¹</dd><dt>Modal gain Γg</dt><dd>{modal.toFixed(4)} cm⁻¹</dd><dt>Loss αi+αm</dt><dd>{loss.toFixed(4)} cm⁻¹</dd><dt>Status</dt><dd data-testid="gain-kind" className={dn > 0 ? 'pos' : 'neg'}>{kind}</dd>
      <dt>Oscillation?</dt><dd>{modal > loss ? 'Γg > αi+αm: yes, gain beats loss' : `no: inversion alone is not enough, need ΔN/N > ${nth.toFixed(3)}`}</dd></dl></section>
    <section><svg viewBox={`0 0 ${W} ${H}`} className="diagram" role="img" aria-label="Modal gain versus inversion">
      <line x1="30" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="#3a4a78" /><line x1={X(0)} x2={X(0)} y1="8" y2={H - 20} stroke="#3a4a78" />
      <line x1="30" x2={W - 10} y1={Y(loss)} y2={Y(loss)} stroke="#ff4d5e" strokeDasharray="4 3" /><text x="34" y={Y(loss) - 3} fill="#ff4d5e" fontSize="10">loss αi+αm</text>
      <polyline fill="none" stroke="#3ddc97" strokeWidth="2" points={xs.map((x) => `${X(x)},${Y(modalAt(x))}`).join(' ')} /><circle cx={X(dn)} cy={Y(modal)} r="5" fill="#ffd24a" />
      <text x="34" y={H - 4} fill="#9fb0d3" fontSize="10">ΔN/N: −0.5 (absorption) … 0 (transparent) … 1 (gain) · y: Γg [cm⁻¹]</text></svg>
      <p className="note">Below zero the medium absorbs; at zero it is transparent; above zero it amplifies. The dashed line is the cavity loss: oscillation needs the gain curve to cross above it.</p></section></div>);
}
