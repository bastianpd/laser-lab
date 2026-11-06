import React from 'react';
// One dot = 1% of N_total. ΔN = n2 − n1 decides the status.
export default function PopulationInversion({ y }) {
  const [, n2, n1] = y, dn = n2 - n1, col = (n, c) => Array.from({ length: Math.round(n * 100) }, (_, i) => <circle key={i} data-kind="dot" cx={8 + (i % 10) * 9} cy={96 - Math.floor(i / 10) * 9} r="3.4" fill={c} />);
  return (<svg viewBox="0 0 270 135" className="diagram" role="img" aria-label="Population inversion">
    <g>{col(n2, '#b36bff')}<text x="8" y="112" fill="#c9d4ee" fontSize="11">N2 = {(100 * n2).toFixed(1)} %</text></g>
    <g transform="translate(150 0)">{col(n1, '#8d97ad')}<text x="8" y="112" fill="#c9d4ee" fontSize="11">N1 = {(100 * n1).toFixed(1)} %</text></g>
    <text x="8" y="128" fontSize="12" fill={dn > 0 ? '#3ddc97' : '#ff8a8a'}>ΔN/N = {dn.toFixed(4)} — {dn > 0 ? 'inverted' : 'not inverted'}</text></svg>);
}
