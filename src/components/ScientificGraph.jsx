import React from 'react';
// Lightweight SVG time-series plot (Plotly omitted to keep the bundle small).
export default function ScientificGraph({ title, hist, series, unit }) {
  const W = 360, H = 160, m = 28;
  const all = hist.flatMap((p) => series.map((s) => s.get(p)));
  const max = Math.max(1e-12, ...all), min = Math.min(0, ...all);
  const t0 = hist[0]?.t ?? 0, t1 = hist.at(-1)?.t ?? 1;
  const X = (t) => m + ((t - t0) / Math.max(1e-9, t1 - t0)) * (W - m - 6), Y = (v) => H - 18 - ((v - min) / (max - min)) * (H - 28);
  return (<figure className="graph"><figcaption>{title} <span>({unit})</span></figcaption>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      <line x1={m} y1={Y(0)} x2={W - 6} y2={Y(0)} className="axis" />
      {series.map((s) => <polyline key={s.name} fill="none" stroke={s.color} strokeWidth="1.8" points={hist.map((p) => `${X(p.t)},${Y(s.get(p))}`).join(' ')} />)}
      <text x={m} y="10" className="tick">{max.toExponential(1)}</text>
      <text x={W - 6} y={H - 4} textAnchor="end" className="tick">t = {t1.toFixed(0)} ns</text></svg>
    <div className="legend">{series.map((s) => <b key={s.name} style={{ color: s.color }}>{s.name}</b>)}</div></figure>);
}
