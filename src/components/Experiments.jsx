import React, { useState, useEffect } from 'react';
import EnergyLevelDiagram from './EnergyLevelDiagram.jsx';
import LaserCavity from './LaserCavity.jsx';
import { toInternal } from '../physics/laserFourLevel.js';
import { thresholdPumpRate } from '../physics/opticalGain.js';
import { laserStatus } from './ScientificDashboard.jsx';
// Each step sets the pump (relative to the current Wp_th), optionally resets or injects photons; the simulation does the rest.
const STEPS = [
  ['Thermal equilibrium', 'All atoms sit in E0; pump off, no photons.', 'n0 = 1, n1 = n2 = n3 = 0', () => ({ Wp: 0 }), { reset: true }],
  ['Increase the pump', 'The pump rate Wp is raised to half the threshold value.', 'dn3/dt = Wp·n0 − n3/τ32', (W) => ({ Wp: 0.5 * W })],
  ['Population moves E0 → E3', 'Pump photons lift atoms into the short-lived pump level.', 'Wp·n0 = rate out of E0', (W) => ({ Wp: 0.5 * W })],
  ['Fast relaxation E3 → E2', 'E3 empties quickly (τ32 ≪ τsp) into the metastable level.', 'n3/τ32 feeds E2', (W) => ({ Wp: 0.5 * W })],
  ['Accumulation in E2', 'E2 decays slowly (τsp), so atoms pile up there.', 'dn2/dt = n3/τ32 − n2/τsp', (W) => ({ Wp: 0.5 * W })],
  ['Population inversion', 'n2 exceeds n1 because E1 empties fast (τ1); gain is positive but still below the cavity loss.', 'ΔN = N2 − N1 > 0', (W) => ({ Wp: 0.8 * W })],
  ['Introduce a photon', 'A seed photon density is injected into the cavity mode.', 'dS/dt = Γvgσ(N2−N1)S + … − S/τc', (W) => ({ Wp: 0.8 * W }), { inject: 1e15 }],
  ['Stimulated emission', 'The seed photons trigger E2 → E1 transitions; watch the red arrow.', 'stim = vg·σ·(n2−n1)·S', (W) => ({ Wp: 0.8 * W })],
  ['Photon amplification', 'Gain g = σΔN amplifies the photons, but Γg < αi+αm so they still die out.', 'g = σ(N2−N1)', (W) => ({ Wp: 0.8 * W }), { inject: 1e15 }],
  ['Reach the threshold', 'Pump at Wp_th: Γg = αi+αm. Gain exactly balances the losses.', 'Γ·g_th = αi + αm', (W) => ({ Wp: W })],
  ['Laser oscillation', 'Above threshold the photon density grows and clamps the inversion at Δn_th.', 'Γg = αi+αm (steady state)', (W) => ({ Wp: 1.5 * W }), { inject: 1e12 }],
];
export default function Experiments({ sim, p, onApply }) {
  const [i, setI] = useState(0), L = laserStatus(sim.state, p), [title, text, eq] = STEPS[i];
  const go = (k) => { setI(k); const [, , , patch, opt] = STEPS[k], W = thresholdPumpRate(toInternal(p)); onApply({ Wp: Math.min(0.05, patch(W).Wp) }, opt || {}); };
  useEffect(() => { go(0); }, []); // eslint-disable-line
  return (<div className="grid"><section><h2>Experiment: from pumping to laser emission</h2><p><b>Step {i + 1} / {STEPS.length}</b> — {title}</p><p>{text}</p><p className="eq">{eq}</p>
    <div className="bar"><button onClick={() => go(Math.max(0, i - 1))} disabled={i === 0}>Previous</button><button onClick={() => go(Math.min(STEPS.length - 1, i + 1))} disabled={i === STEPS.length - 1}>Next</button><button onClick={() => go(0)}>Restart</button></div>
    <dl><dt>n3 / n2</dt><dd>{sim.state.n3.toFixed(4)} / {sim.state.n2.toFixed(4)}</dd><dt>ΔN/N</dt><dd>{L.dn.toFixed(4)}</dd><dt>Photon density</dt><dd>{sim.state.S.toExponential(2)} cm⁻³</dd><dt>Pump Wp</dt><dd>{p.Wp.toFixed(4)} ns⁻¹</dd><dt>Regime</dt><dd>{L.st}</dd></dl></section>
    <section><EnergyLevelDiagram y={sim.y} params={p} t={sim.t} />{i >= 6 && <LaserCavity y={sim.y} params={p} t={sim.t} />}</section></div>);
}
