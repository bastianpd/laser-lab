// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import App from '../src/App.jsx';
afterEach(cleanup);
const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const time = () => parseFloat(screen.getByTestId('time').textContent), num = (id) => parseFloat(screen.getByTestId(id).textContent);
const slide = (label, v) => fireEvent.change(screen.getByLabelText(label), { target: { value: String(v) } });
const click = (name) => fireEvent.click(screen.getByRole('button', { name }));
const tab = (name) => fireEvent.click(screen.getByRole('tab', { name }));
describe('interactive controls', () => {
  it('pump slider updates the parameter and the dashboard', () => { render(<App />); slide('Pump rate Wp', 0.03); expect(screen.getByTestId('wp').textContent).toContain('0.0300'); });
  it('cavity-lifetime slider changes the loss indicator', () => { render(<App />); const a = num('loss'); slide('Cavity photon lifetime τc', 0.3); expect(num('loss')).toBeGreaterThan(2 * a); });
  it('Stop/Start pumping toggles Wp', () => { render(<App />); click('Stop pumping'); expect(screen.getByTestId('wp').textContent).toContain('0.0000'); click('Start pumping'); expect(num('wp')).toBeGreaterThan(0); });
  it('pause freezes physical time, resume continues, reset returns to 0', async () => {
    render(<App />); await wait(300); expect(time()).toBeGreaterThan(0);
    click('Pause'); const t1 = time(); await wait(200); expect(time()).toBe(t1);
    click('Resume'); await wait(200); expect(time()).toBeGreaterThan(t1);
    click('Reset'); await wait(60); expect(time()).toBe(0);
  });
  it('speed slider scales simulated time', async () => {
    render(<App />); slide('Simulation speed', 1); click('Reset'); click('Start'); await wait(300); const a = time();
    click('Reset'); slide('Simulation speed', 5); click('Start'); await wait(300); expect(screen.getByText(/Speed ×5/)).toBeTruthy(); expect(time()).toBeGreaterThan(2 * a);
  });
  it('regime badge follows the pump relative to threshold', () => { render(<App />); slide('Pump rate Wp', 0.001); expect(screen.getByTestId('regime').textContent).toBe('below threshold'); slide('Pump rate Wp', 0.03); expect(screen.getByTestId('regime').textContent).toBe('above threshold'); slide('Cavity photon lifetime τc', 0.1); expect(screen.getByTestId('regime').textContent).toBe('below threshold'); });
  it('simulation responds to pumping: photon density builds up above threshold', async () => {
    render(<App />); slide('Pump rate Wp', 0.05); slide('Simulation speed', 5); expect(num('photon')).toBe(0);
    await waitFor(() => expect(num('photon')).toBeGreaterThan(1e12), { timeout: 10000 });
  }, 15000);
  it('simulated time is never negative', async () => { render(<App />); for (let i = 0; i < 5; i++) { await wait(60); expect(time()).toBeGreaterThanOrEqual(0); } });
  it('guided experiment: steps apply parameters; state persists across tabs', () => {
    render(<App />); tab('Guided experiment'); expect(screen.getByText(/Step 1 \/ 11/)).toBeTruthy(); expect(screen.getByRole('button', { name: 'Previous' }).disabled).toBe(true);
    click('Next'); expect(screen.getByText(/Step 2 \/ 11/)).toBeTruthy(); tab('Simulator'); expect(screen.getByTestId('wp').textContent).toContain('0.0019');
    tab('Guided experiment'); click('Restart'); expect(screen.getByText(/Step 1 \/ 11/)).toBeTruthy();
  });
  it('lifetime tab exposes the four lifetime sliders', () => { render(<App />); tab('Lifetimes'); for (const l of ['Pump-level lifetime τ32', 'Upper laser level lifetime τsp', 'Lower-level lifetime τ1', 'Cavity photon lifetime τc']) expect(screen.getByLabelText(l)).toBeTruthy(); });
  it('3-level vs 4-level: weak pump inverts only the four-level system', async () => {
    render(<App />); tab('3-level vs 4-level'); slide('Pump rate Wp', 0.002); await wait(700); expect(num('dn4')).toBeGreaterThan(0); expect(num('dn3')).toBeLessThan(0); expect(num('inv3')).toBeCloseTo(0.01, 4);
  });
});
describe('phase 5 additions', () => {
  it('optical gain tab: sign of gain follows the inversion slider', () => {
    render(<App />); tab('Optical gain'); slide('Population inversion ΔN/N', 0.4); expect(num('gain')).toBeGreaterThan(0); expect(screen.getByTestId('gain-kind').textContent).toContain('amplification');
    slide('Population inversion ΔN/N', -0.3); expect(num('gain')).toBeLessThan(0); expect(screen.getByTestId('gain-kind').textContent).toContain('absorption');
    slide('Population inversion ΔN/N', 0); expect(num('gain')).toBe(0); expect(screen.getByTestId('gain-kind').textContent).toContain('transparency');
  });
  it('gain tab: high loss means inversion alone does not give oscillation', () => { render(<App />); tab('Optical gain'); slide('Population inversion ΔN/N', 0.1); slide('Cavity photon lifetime τc', 0.1); expect(screen.getByText(/inversion alone is not enough/)).toBeTruthy(); });
  it('wavelength can be typed digit by digit and sets the photon energy', () => { render(<App />); const w = screen.getByLabelText('Wavelength'); fireEvent.change(w, { target: { value: '15' } }); expect(w.value).toBe('15'); fireEvent.change(w, { target: { value: '1550' } }); expect(screen.getByText(/0\.800 eV \(λ = 1550 nm\)/)).toBeTruthy(); });
  it('inject seed photons triggers a photon density', async () => { render(<App />); click('Pause'); click('Stop pumping'); expect(num('photon')).toBe(0); click('Inject seed photons'); await wait(40); expect(num('photon')).toBeGreaterThan(1e14); });
});
