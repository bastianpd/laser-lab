import React from 'react';
import { photonEnergyEV } from '../physics/physicalConstants.js';
import { fluxes, intensities, particlesOn, largestRemainder, phaseAt } from '../physics/visualModel.js';
const Y = { 3: 40, 2: 110, 1: 200, 0: 280 };
// Arrows: blue pump, gray relaxation, yellow spontaneous, red stimulated. Moving particles ∝ flux; dots = populations.
export default function EnergyLevelDiagram({ y, params, t = 0, lambdaNm = 1064 }) {
  const I = intensities(fluxes(y, params)), [n3, n2, n1, n0] = y;
  const dotsPer = largestRemainder([n3, n2, n1, n0], 60), lv = [[3, n3, '#8b7bff', 'E3 pump level'], [2, n2, '#b36bff', 'E2 upper laser level (metastable)'], [1, n1, '#8b7bff', 'E1 lower laser level'], [0, n0, '#6e7a96', 'E0 ground state']];
  const tr = [['pump', 90, 0, 3, '#4aa3ff', 'pumping'], ['relax32', 150, 3, 2, '#8d97ad', 'fast relaxation'], ['spont', 215, 2, 1, '#ffd24a', 'spontaneous'], ['stim', 275, 2, 1, '#ff4d5e', 'stimulated'], ['relax10', 340, 1, 0, '#8d97ad', 'fast relaxation']];
  return (<svg viewBox="0 0 520 330" className="diagram" role="img" aria-label="Four-level energy diagram driven by the simulation state">
    {lv.map(([k, n, c, l], r) => <g key={k}><line x1="40" x2="480" y1={Y[k]} y2={Y[k]} stroke={c} strokeWidth="3" />
      <text x="42" y={Y[k] - 8} fill="#c9d4ee" fontSize="12">{l}</text><text x="480" y={Y[k] + 15} textAnchor="end" fill="#c9d4ee" fontSize="11">n = {n.toFixed(4)}</text>
      {Array.from({ length: dotsPer[r] }, (_, i) => <circle key={i} data-kind="pop" cx={380 + (i % 15) * 6.5} cy={Y[k] - 6 - Math.floor(i / 15) * 7} r="2.6" fill={c} />)}</g>)}
    {tr.map(([key, x, a, b, c, label]) => {
      const v = I[key], absorb = key === 'stim' && v < 0, [from, to] = absorb ? [b, a] : [a, b], col = absorb ? '#8d97ad' : c;
      return <g key={key} opacity={Math.abs(v) > 0 ? 1 : 0.3}><line x1={x} x2={x} y1={Y[from]} y2={Y[to]} stroke={col} strokeWidth="1.5" strokeDasharray="3 4" />
        <text x={x + 4} y={(Y[a] + Y[b]) / 2 + (key === 'stim' ? 12 : 0)} fill={col} fontSize="10">{absorb ? 'absorption' : label}</text>
        {Array.from({ length: particlesOn(v) }, (_, j) => <circle key={j} data-kind={key} cx={x} cy={Y[from] + (Y[to] - Y[from]) * phaseAt(t, j / particlesOn(v))} r="4.5" fill={col} />)}</g>; })}
    <text x="40" y="318" fill="#c9d4ee" fontSize="12">E2−E1 = hc/λ = {photonEnergyEV(lambdaNm).toFixed(3)} eV (λ = {lambdaNm} nm)</text></svg>);
}
