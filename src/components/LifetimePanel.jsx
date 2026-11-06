import React from 'react';
import ParameterControls from './ParameterControls.jsx';
import GraphPanel from './GraphPanel.jsx';
// Log-scale bars: atomic population lifetimes vs the cavity photon lifetime.
export default function LifetimePanel({ p, setP, hist }) {
  const items = [['τ32 pump level', p.tau32, '#8b7bff'], ['τsp upper level', p.tauSp, '#b36bff'], ['τ1 lower level', p.tau1, '#8d97ad'], ['τc cavity photon', p.tauC, '#ff4d5e']];
  const w = (v) => Math.max(2, ((Math.log10(v) + 1.3) / (Math.log10(500) + 1.3)) * 100);
  return (<div className="grid"><section><h2>Lifetimes</h2><ParameterControls p={p} setP={setP} keys={['tau32', 'tauSp', 'tau1', 'tauC']} />
    {items.map(([l, v, c]) => <div key={l} className="lt"><span>{l} = {v} ns</span><b style={{ width: w(v) + '%', background: c }} /></div>)}
    <p className="note">Inversion needs τsp &gt; τ1: here τsp/τ1 = {(p.tauSp / p.tau1).toFixed(0)} ({p.tauSp > p.tau1 ? 'favourable' : 'no inversion possible'}). Atomic lifetimes set how long energy is stored in a level; τc is how long a photon survives in the cavity (1/τc = vg(αi+αm)). Here τsp/τc = {(p.tauSp / p.tauC).toFixed(0)}: a metastable level stores energy long compared with a photon&apos;s life, so pumping can accumulate inversion that stimulated emission then releases as a burst.</p></section>
    <section><h2>Dynamics</h2><GraphPanel hist={hist} p={p} /></section></div>);
}
