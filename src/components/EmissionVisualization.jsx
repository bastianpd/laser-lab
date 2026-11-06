import React from 'react';
import { fluxes, particlesOn, phaseAt } from '../physics/visualModel.js';
// Left: spontaneous emission (random directions, rate n2/τsp). Right: stimulated (incident photon + identical twin, same
// direction/phase, rate vg σ ΔN S). Counts follow the live flux ratio; angles are fixed golden-angle offsets.
export default function EmissionVisualization({ y, params, t = 0 }) {
  const f = fluxes(y, params), m = Math.max(1e-30, f.spont, Math.abs(f.stim)), ks = particlesOn(Math.sqrt(f.spont / m)), kt = f.stim > 0 ? particlesOn(Math.sqrt(f.stim / m)) : 0;
  return (<svg viewBox="0 0 520 170" className="diagram" role="img" aria-label="Spontaneous versus stimulated emission">
    <text x="10" y="14" fill="#ffd24a" fontSize="12">Spontaneous: random direction &amp; phase</text><text x="270" y="14" fill="#ff4d5e" fontSize="12">Stimulated: same mode, direction &amp; phase</text>
    <circle cx="125" cy="90" r="9" fill="#b36bff" /><circle cx="385" cy="90" r="9" fill="#b36bff" />
    {Array.from({ length: ks }, (_, i) => { const a = i * 2.39996, r = 14 + 60 * phaseAt(t, i / ks); return <circle key={i} data-kind="spont" data-angle={a.toFixed(2)} cx={125 + r * Math.cos(a)} cy={90 + r * Math.sin(a)} r="4" fill="#ffd24a" />; })}
    {Array.from({ length: kt }, (_, i) => { const x = 320 + 130 * phaseAt(t, i / kt); return <g key={i}><circle data-kind="stim" data-angle="0" cx={x} cy="84" r="4" fill="#ff4d5e" /><circle data-kind="stim" data-angle="0" cx={x - 12} cy="84" r="4" fill="#ff4d5e" /></g>; })}
    <text x="10" y="162" fill="#c9d4ee" fontSize="11">spont = {f.spont.toExponential(2)} ns⁻¹ · stim = {f.stim.toExponential(2)} ns⁻¹ · stim/spont = {(f.stim / f.spont || 0).toFixed(2)}</text></svg>);
}
