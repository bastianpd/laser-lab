import React from 'react';
import { defaultParams } from '../data/defaultParameters.js';
export default function SimulationControls({ sim, speed, setSpeed, p, setP, status }) {
  return (<section className="bar" aria-label="Simulation controls">
    <button onClick={() => sim.setRunning(true)} disabled={sim.running}>{sim.t ? 'Resume' : 'Start'}</button>
    <button onClick={() => sim.setRunning(false)} disabled={!sim.running}>Pause</button>
    <button onClick={() => { sim.setRunning(false); sim.reset(); }}>Reset</button>
    <button onClick={() => setP((q) => ({ ...q, Wp: q.Wp ? 0 : defaultParams.Wp }))}>{p.Wp ? 'Stop pumping' : 'Start pumping'}</button>
    <label>Speed ×{speed}<input type="range" aria-label="Simulation speed" min="0.1" max="5" step="0.1" value={speed} onChange={(e) => setSpeed(+e.target.value)} /></label>
    <span data-testid="regime" className={`badge ${status.st.replace(' ', '-')}`}>{status.st}</span></section>);
}
