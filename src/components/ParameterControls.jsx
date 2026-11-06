import React from 'react';
import { limits } from '../data/defaultParameters.js';
// Sliders are clamped to the physical range; each shows label, value and unit, with the explanation as tooltip.
export default function ParameterControls({ p, setP, keys = Object.keys(limits) }) {
  return keys.map((k) => { const [lo, hi, st, u, tip] = limits[k], label = tip.split(':')[0];
    return (<label className="row" key={k} title={tip}>{label} = {p[k]} {u}
      <input type="range" aria-label={label} min={lo} max={hi} step={st} value={p[k]} onChange={(e) => setP((q) => ({ ...q, [k]: Math.min(hi, Math.max(lo, +e.target.value)) }))} /></label>); });
}
