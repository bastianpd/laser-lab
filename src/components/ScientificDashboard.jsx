import React from 'react';
import { toInternal } from '../physics/laserFourLevel.js';
import { gain, modalGain, lossRate, thresholdInversion, thresholdPumpRate, pumpRegime } from '../physics/opticalGain.js';
export function laserStatus(state, p) {
  const P = toInternal(p), dn = state.n2 - state.n1, g = gain(P.sigma, dn * P.Ntot), modal = modalGain(P.gamma, g), loss = lossRate(P.vg, P.tauC);
  return { P, dn, g, modal, loss, ratio: Math.max(0, modal / loss), Wth: thresholdPumpRate(P), st: pumpRegime(p.Wp, thresholdPumpRate(P)), nth: thresholdInversion(P) };
}
export default function ScientificDashboard({ state, p, t, viol, L = laserStatus(state, p) }) {
  const { P, dn, g, loss, ratio, Wth, nth } = L, f = (v) => v.toExponential(2);
  return (<><div className="meter" role="meter" aria-label="Modal gain over cavity loss" aria-valuenow={ratio.toFixed(2)}><div className={'fill ' + L.st.replace(' ', '-')} style={{ width: Math.min(100, ratio * 50) + '%' }} /><i className="tick" title="threshold: Γg = αi+αm" /></div>
    <p className="note">Γg / (αi+αm) = {ratio.toFixed(2)} — oscillation needs &gt; 1 (tick). Pump Wp / Wp_th = {Number.isFinite(Wth) ? (p.Wp / Wth).toFixed(2) : 'n/a'}</p>
    <dl><dt>Pump rate Wp</dt><dd data-testid="wp">{p.Wp.toFixed(4)} ns⁻¹</dd><dt>Threshold pump Wp_th</dt><dd>{Number.isFinite(Wth) ? Wth.toFixed(4) : 'unreachable'} ns⁻¹</dd>
      <dt>N2 / N1</dt><dd>{f(state.n2 * P.Ntot)} / {f(state.n1 * P.Ntot)} cm⁻³</dd>
      <dt>ΔN = N2−N1</dt><dd className={dn > 0 ? 'pos' : 'neg'}>{f(dn * P.Ntot)} cm⁻³ ({dn > 0 ? 'inverted' : 'not inverted'})</dd>
      <dt>Gain g = σΔN</dt><dd>{g.toFixed(4)} cm⁻¹</dd><dt>Threshold inversion</dt><dd>Δn_th = {nth.toFixed(3)} (now {dn.toFixed(3)})</dd>
      <dt>Loss αi+αm</dt><dd data-testid="loss">{loss.toFixed(4)} cm⁻¹</dd><dt>Photon density S</dt><dd data-testid="photon">{f(state.S)} cm⁻³</dd>
      <dt>Time / solver flags</dt><dd><span data-testid="time">{t.toFixed(0)}</span> ns / {viol} violations</dd></dl></>);
}
