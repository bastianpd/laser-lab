import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup as R } from 'react-dom/server';
import EnergyLevelDiagram from '../src/components/EnergyLevelDiagram.jsx';
import PopulationInversion from '../src/components/PopulationInversion.jsx';
import EmissionVisualization from '../src/components/EmissionVisualization.jsx';
import LaserCavity from '../src/components/LaserCavity.jsx';
import { advance, initialState } from '../src/physics/laserFourLevel.js';
import { defaultParams as D } from '../src/data/defaultParameters.js';
const n = (h, s) => h.split(s).length - 1, lasing = advance(initialState(), { ...D, Wp: 0.02 }, 3000).y, below = advance(initialState(), { ...D, Wp: 0.002 }, 3000).y;
describe('EnergyLevelDiagram', () => {
  it('equilibrium, pump off: 60 dots, no moving particles', () => { const h = R(<EnergyLevelDiagram y={initialState()} params={{ ...D, Wp: 0 }} />); expect(n(h, 'data-kind="pop"')).toBe(60); for (const k of ['pump', 'spont', 'stim', 'relax32', 'relax10']) expect(n(h, `data-kind="${k}"`)).toBe(0); });
  it('equilibrium, pump on: only the pump transition is active', () => { const h = R(<EnergyLevelDiagram y={initialState()} params={D} />); expect(n(h, 'data-kind="pump"')).toBe(4); for (const k of ['spont', 'stim', 'relax32', 'relax10']) expect(n(h, `data-kind="${k}"`)).toBe(0); });
  it('Wp = 0 draws no pump particles even with population in E2', () => expect(n(R(<EnergyLevelDiagram y={[0, 0.3, 0.1, 0.6, 0]} params={{ ...D, Wp: 0 }} />), 'data-kind="pump"')).toBe(0));
  it('below threshold: pump, spontaneous and relaxation particles, no stimulated', () => { const h = R(<EnergyLevelDiagram y={below} params={{ ...D, Wp: 0.002 }} />); expect(n(h, 'data-kind="pump"')).toBeGreaterThan(0); expect(n(h, 'data-kind="spont"')).toBeGreaterThan(0); expect(n(h, 'data-kind="stim"')).toBe(0); });
  it('lasing: stimulated particles appear', () => expect(n(R(<EnergyLevelDiagram y={lasing} params={{ ...D, Wp: 0.02 }} />), 'data-kind="stim"')).toBeGreaterThan(0));
  it('population dots track state (E2-rich state)', () => { const h = R(<EnergyLevelDiagram y={[0, 1, 0, 0, 0]} params={D} />); expect(n(h, 'fill="#b36bff"')).toBeGreaterThanOrEqual(60); });
  it('particles move with physical time and freeze when t is constant', () => { const a = R(<EnergyLevelDiagram y={below} params={D} t={10} />), b = R(<EnergyLevelDiagram y={below} params={D} t={10} />), c = R(<EnergyLevelDiagram y={below} params={D} t={20} />); expect(a).toBe(b); expect(a).not.toBe(c); });
});
describe('PopulationInversion', () => {
  it('inverted vs not inverted', () => { expect(R(<PopulationInversion y={below} />)).toContain('— inverted'); expect(R(<PopulationInversion y={[0, 0.1, 0.4, 0.5, 0]} />)).toContain('not inverted'); });
  it('dot count = round(100 n)', () => expect(n(R(<PopulationInversion y={[0, 0.3, 0.1, 0.6, 0]} />), 'data-kind="dot"')).toBe(40));
});
describe('EmissionVisualization', () => {
  it('no stimulated photons at S = 0; spontaneous present', () => { const h = R(<EmissionVisualization y={[0, 0.3, 0.01, 0.69, 0]} params={D} />); expect(n(h, 'data-kind="stim"')).toBe(0); expect(n(h, 'data-kind="spont"')).toBe(4); });
  it('stimulated photons come in identical co-directional pairs', () => { const h = R(<EmissionVisualization y={lasing} params={{ ...D, Wp: 0.02 }} />), k = n(h, 'data-kind="stim"'); expect(k).toBeGreaterThan(0); expect(k % 2).toBe(0); expect(n(h, 'data-kind="stim" data-angle="0"')).toBe(k); });
  it('spontaneous directions are all different', () => { const a = [...R(<EmissionVisualization y={below} params={D} />).matchAll(/data-kind="spont" data-angle="([^"]+)"/g)].map((m) => m[1]); expect(new Set(a).size).toBe(a.length); });
});
describe('LaserCavity', () => {
  it('below threshold: no photon glyphs, no output beam', () => { const h = R(<LaserCavity y={below} params={{ ...D, Wp: 0.002 }} />); expect(n(h, 'data-kind="photon"')).toBe(0); expect(n(h, 'data-kind="output"')).toBe(0); expect(h).toContain('below threshold'); });
  it('above threshold: photons, output beam, loss arrow', () => { const h = R(<LaserCavity y={lasing} params={{ ...D, Wp: 0.02 }} />); expect(n(h, 'data-kind="photon"')).toBeGreaterThan(3); expect(n(h, 'data-kind="output"')).toBe(1); expect(n(h, 'data-kind="loss"')).toBe(1); });
  it('inversion with high loss stays below threshold', () => { const p = { ...D, Wp: 0.004, tauC: 0.1 }, y = advance(initialState(), p, 3000).y; expect(R(<LaserCavity y={y} params={p} />)).toContain('below threshold'); });
  it('more photons with higher S', () => expect(n(R(<LaserCavity y={[0, 0.3, 0.05, 0.65, 1e17]} params={D} />), 'data-kind="photon"')).toBeGreaterThan(n(R(<LaserCavity y={[0, 0.3, 0.05, 0.65, 1e14]} params={D} />), 'data-kind="photon"')));
});
