import React from 'react';
import ParameterControls from './ParameterControls.jsx';
import ScientificGraph from './ScientificGraph.jsx';
import { useSimulation } from '../hooks/useSimulation.js';
import { toInternal } from '../physics/laserFourLevel.js';
import { thresholdPumpRate } from '../physics/opticalGain.js';
import { thresholdPumpRate3, inversionPumpRate3 } from '../physics/laserThreeLevel.js';
const Bars = ({ title, items }) => (<svg viewBox="0 0 260 110" className="diagram" role="img" aria-label={title}><text x="4" y="12" fill="#c9d4ee" fontSize="12">{title}</text>
  {items.map(([l, v, c], k) => <g key={l}><rect x={10 + k * 62} y={100 - 70 * v} width="44" height={70 * v} fill={c} /><text x={10 + k * 62} y="108" fill="#c9d4ee" fontSize="9">{l} {(100 * v).toFixed(0)}%</text></g>)}</svg>);
export default function ThreeLevelComparison({ p, setP, speed }) {
  const s4 = useSimulation(p, speed, 'four'), s3 = useSimulation(p, speed, 'three'), P = toInternal(p), n4 = s4.state, n3 = s3.state, dn4 = n4.n2 - n4.n1, dn3 = n3.n2 - n3.n1;
  const hist = s4.hist.map((q, i) => ({ t: q.t, a: q.n2 - q.n1, b: s3.hist[i] ? s3.hist[i].n2 - s3.hist[i].n1 : 0 })), fmt = (v) => (Number.isFinite(v) ? v.toFixed(4) : 'unreachable');
  const both = (f) => { f(s4); f(s3); };
  return (<div className="grid"><section><h2>Same atoms, same pump Wp</h2><ParameterControls p={p} setP={setP} keys={['Wp', 'tauSp', 'tau1', 'tauC']} />
    <div className="bar"><button onClick={() => both((s) => s.setRunning(!s4.running))}>{s4.running ? 'Pause' : 'Resume'}</button><button onClick={() => both((s) => s.reset())}>Reset both</button></div>
    <dl><dt>Pump needed for inversion</dt><dd>4-level: any Wp &gt; 0 · 3-level: Wp &gt; 1/τsp = <span data-testid="inv3">{fmt(inversionPumpRate3(P))}</span> ns⁻¹</dd>
      <dt>Threshold pump Wp_th</dt><dd>4-level {fmt(thresholdPumpRate(P))} · 3-level {fmt(thresholdPumpRate3(P))} ns⁻¹</dd>
      <dt>ΔN/N now</dt><dd>4-level <span data-testid="dn4">{dn4.toFixed(4)}</span> · 3-level <span data-testid="dn3">{dn3.toFixed(4)}</span></dd></dl>
    <p className="note">In a three-level laser the lower laser level is the ground state, which holds almost all atoms, so more than half must be lifted to E2 before n2 &gt; n1. In the four-level scheme E1 is empty (fast τ1 decay), so any pump gives inversion.</p></section>
    <section><Bars title="Four-level populations" items={[['E3', n4.n3, '#8b7bff'], ['E2', n4.n2, '#b36bff'], ['E1', n4.n1, '#8d97ad'], ['E0', n4.n0, '#6e7a96']]} />
      <Bars title="Three-level populations" items={[['E3', n3.n3, '#8b7bff'], ['E2', n3.n2, '#b36bff'], ['E1=gnd', n3.n1, '#6e7a96']]} />
      <ScientificGraph title="Inversion ΔN/N: four-level (a) vs three-level (b)" unit="fraction" hist={hist.length ? hist : [{ t: 0, a: 0, b: 0 }]} series={[{ name: '4-level', color: '#3ddc97', get: (q) => q.a }, { name: '3-level', color: '#ffd24a', get: (q) => q.b }]} /></section></div>);
}
