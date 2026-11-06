import React, { useState } from 'react';
import { useSimulation } from './hooks/useSimulation.js';
import { defaultParams } from './data/defaultParameters.js';
import EnergyLevelDiagram from './components/EnergyLevelDiagram.jsx';
import LaserCavity from './components/LaserCavity.jsx';
import PopulationInversion from './components/PopulationInversion.jsx';
import EmissionVisualization from './components/EmissionVisualization.jsx';
import ParameterControls from './components/ParameterControls.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import ScientificDashboard, { laserStatus } from './components/ScientificDashboard.jsx';
import GraphPanel from './components/GraphPanel.jsx';
import LifetimePanel from './components/LifetimePanel.jsx';
import GainPanel from './components/GainPanel.jsx';
import Experiments from './components/Experiments.jsx';
import ThreeLevelComparison from './components/ThreeLevelComparison.jsx';
const TABS = ['Simulator', 'Optical gain', 'Lifetimes', 'Guided experiment', '3-level vs 4-level'];
export default function App() {
  const [p, setP] = useState(defaultParams), [speed, setSpeed] = useState(1), [lambdaText, setLambdaText] = useState('1064'), [tab, setTab] = useState(TABS[0]);
  const sim = useSimulation(p, speed), L = laserStatus(sim.state, p), lambda = Math.min(3000, Math.max(200, +lambdaText || 1064));
  const onApply = (patch, { reset, inject } = {}) => { if (reset) sim.reset(); setP((q) => ({ ...q, ...patch })); sim.setRunning(true); if (inject) sim.inject(inject); };
  return (<main>
    <header><h1>LaserLab</h1><p>Pump a four-level system, watch population inversion build, and see when gain beats cavity loss.</p></header>
    <details className="intro" open><summary>What is a laser?</summary>
      <p><b>L</b>ight <b>A</b>mplification by <b>S</b>timulated <b>E</b>mission of <b>R</b>adiation. A laser needs a gain medium, a pump that creates population inversion, and a resonator (two mirrors, one partly transmitting) that feeds the light back.</p>
      <p>Ordinary light comes from spontaneous emission: random phase, direction and colour. Laser light is dominated by stimulated emission: photons added to the same mode share frequency, phase, direction and polarization, giving a narrow, directional, coherent beam.</p>
      <p>Use the Emission processes panel and the Inject seed photons button to see the difference, and the tabs below to explore gain, lifetimes, a guided experiment and the three-level comparison.</p></details>
    <nav className="tabs" role="tablist">{TABS.map((t) => <button key={t} role="tab" aria-selected={t === tab} onClick={() => setTab(t)}>{t}</button>)}</nav>
    {!['3-level vs 4-level', 'Optical gain'].includes(tab) && <SimulationControls sim={sim} speed={speed} setSpeed={setSpeed} p={p} setP={setP} status={L} />}
    {tab === 'Simulator' && <div className="grid">
      <section><h2>Energy levels</h2><EnergyLevelDiagram y={sim.y} params={p} t={sim.t} lambdaNm={lambda} />
        <label className="row">Laser wavelength λ (nm)<input type="number" aria-label="Wavelength" min="200" max="3000" value={lambdaText} onChange={(e) => setLambdaText(e.target.value)} onBlur={() => setLambdaText(String(lambda))} /></label>
        <h2>Population inversion</h2><PopulationInversion y={sim.y} /><h2>Emission processes</h2><button onClick={() => sim.inject(1e15)}>Inject seed photons</button><EmissionVisualization y={sim.y} params={p} t={sim.t} /><h2>Resonator</h2><LaserCavity y={sim.y} params={p} t={sim.t} /></section>
      <section><h2>Parameters</h2><ParameterControls p={p} setP={setP} /><p className="note">Times in ns; n = N/N_total. Lifetimes are compressed (illustrative); σ is Nd:YAG-like.</p></section>
      <section><h2>Dashboard</h2><ScientificDashboard state={sim.state} p={p} t={sim.t} viol={sim.viol} L={L} /></section>
      <section><h2>Time evolution</h2><GraphPanel hist={sim.hist} p={p} /></section></div>}
    {tab === 'Optical gain' && <GainPanel p={p} setP={setP} />}
    {tab === 'Lifetimes' && <LifetimePanel p={p} setP={setP} hist={sim.hist} />}
    {tab === 'Guided experiment' && <Experiments sim={sim} p={p} onApply={onApply} />}
    {tab === '3-level vs 4-level' && <ThreeLevelComparison p={p} setP={setP} speed={speed} />}
  </main>);
}
