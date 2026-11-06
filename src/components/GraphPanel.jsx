import React from 'react';
import ScientificGraph from './ScientificGraph.jsx';
import { toInternal } from '../physics/laserFourLevel.js';
import { gain, modalGain, lossRate } from '../physics/opticalGain.js';
export default function GraphPanel({ hist, p }) {
  const P = toInternal(p), loss = lossRate(P.vg, P.tauC), h = hist.length ? hist : [{ t: 0, n3: 0, n2: 0, n1: 0, S: 0 }];
  return (<><ScientificGraph title="Populations" unit="fraction" hist={h} series={[{ name: 'n2', color: '#b36bff', get: (q) => q.n2 }, { name: 'n1', color: '#8d97ad', get: (q) => q.n1 }, { name: 'n3', color: '#4aa3ff', get: (q) => q.n3 }]} />
    <ScientificGraph title="Photon density" unit="cm⁻³" hist={h} series={[{ name: 'S', color: '#ff4d5e', get: (q) => q.S }]} />
    <ScientificGraph title="Net modal gain Γg − (αi+αm)" unit="cm⁻¹" hist={h} series={[{ name: 'Γg−α', color: '#3ddc97', get: (q) => modalGain(P.gamma, gain(P.sigma, (q.n2 - q.n1) * P.Ntot)) - loss }]} /></>);
}
