# LaserLab — Interactive Laser Physics Simulator

An educational, browser-only simulator of a four-level laser (React + Vite, plain JavaScript). It integrates the rate equations in real time and draws the energy levels, populations, emission processes and resonator **from the simulated state**. It is a teaching model, **not** a replacement for laser-design software or experimental characterization.

## Motivation and educational objectives
Show what a laser is, how pumping creates population inversion, how stimulated emission amplifies light, why gain must exceed cavity loss (threshold), how lifetimes shape the dynamics, and why four-level lasers are easier to invert than three-level ones.

## Features
- Animated four-level diagram (pump, relaxation, spontaneous and stimulated arrows with moving particles ∝ flux; dots ∝ populations); wavelength → photon energy.
- Population-inversion view, spontaneous vs stimulated emission view (with a seed-photon button), animated resonator (photon glyphs ∝ log S, gain shading, output beam).
- Optical-gain module (g vs inversion), lifetime module, live dashboard with threshold meter, three real-time graphs.
- Guided 11-step experiment; live three-level vs four-level comparison.
- Controls: Start / Pause / Resume / Reset, pump on/off, speed, clamped parameter sliders.

## Technologies
React 18, Vite 5, Vitest 2, jsdom + Testing Library (interface tests). Graphs are inline SVG (no Plotly). No backend.

## Physical model
Levels: E0 ground, E3 pump, E2 metastable upper laser level, E1 lower laser level. Pump E0→E3, fast E3→E2, laser E2→E1, fast E1→E0. Populations are normalized, $n_i=N_i/N_\mathrm{tot}$ ($\sum n_i=1$); time in ns.

$$\dot n_3=W_p n_0-\frac{n_3}{\tau_{32}},\quad \dot n_2=\frac{n_3}{\tau_{32}}-\frac{n_2}{\tau_{sp}}-v_g\sigma(n_2-n_1)S$$
$$\dot n_1=\frac{n_2}{\tau_{sp}}+v_g\sigma(n_2-n_1)S-\frac{n_1}{\tau_1},\quad \dot n_0=-W_p n_0+\frac{n_1}{\tau_1}$$
$$\dot S=\Gamma v_g\sigma N_\mathrm{tot}(n_2-n_1)S+\beta_{sp}N_\mathrm{tot}\frac{n_2}{\tau_{sp}}-\frac{S}{\tau_c},\qquad \frac1{\tau_c}=v_g(\alpha_i+\alpha_m)$$
Gain $g=\sigma\Delta N$, modal gain $\Gamma g$; threshold $\Gamma g_{th}=\alpha_i+\alpha_m$, i.e. $\Delta n_{th}=1/(\Gamma v_g\sigma N_\mathrm{tot}\tau_c)$. With $S=0$: $W_{p,th}=\Delta n_{th}/[(\tau_{sp}-\tau_1)-\Delta n_{th}(\tau_{32}+\tau_{sp}+\tau_1)]$. Γ = active/mode volume, so $n_2+S/(\Gamma N_\mathrm{tot})$ is conserved without spontaneous decay, loss and βsp (tested). Three-level model: ground state = lower laser level; inversion needs $W_p>1/\tau_{sp}$. Full derivation: `docs/PHYSICS_MODEL.md`.

## Parameters (illustrative; Nd:YAG-like σ, lifetimes compressed)
| Symbol | Meaning | Unit | Default (range) |
|---|---|---|---|
| Wp | pump rate per ground-state atom | ns⁻¹ | 0.01 (0–0.05) |
| τ32, τ1 | pump-level / lower-level lifetime | ns | 1 (0.1–10) |
| τsp | upper-level lifetime (metastable) | ns | 100 (10–500) |
| σ | stimulated-emission cross-section | 10⁻¹⁹ cm² | 2.8 (0.5–10) |
| N_tot | active-atom density | 10¹⁸ cm⁻³ | 1 (0.2–5) |
| τc | cavity photon lifetime | ns | 1 (0.1–5) |
| Γ | confinement factor | – | 0.8 (0.1–1) |
| βsp, vg | spontaneous coupling; group velocity | –, cm/ns | 10⁻⁵, 16.5 (fixed) |
Invalid values (negative lifetimes, σ, N; Γ outside (0,1]) are rejected by the engine.

## Simulation engine
Fixed-step RK4 (0.02 ns), independent of frame rate (200 ns of physical time per real second at speed 1). Sub-steps are capped at half a conservative stability limit; a step giving negative values is bisected, never clipped, and residual violations are counted and shown. Physics (`src/physics`) has no React dependency.

## Run
`npm install` · `npm run dev` · `npm run build` · `npm run preview` · `npm run test`

## Deploy to GitHub Pages
1. Push to the `main` branch of a GitHub repository (commit `package-lock.json`).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. `.github/workflows/deploy.yml` (and a separate non-blocking `tests.yml`) runs `npm ci`, builds and deploys `dist`. The Vite `base` is relative (`./`), so any repository name works; to use an absolute path set `VITE_BASE=/your-repo/`. The app is a single page (tab navigation, no client routes), so no 404 fallback is needed.

## Structure
`src/physics` (rate equations, photon dynamics, gain, solver, parameters, three-level, steady states, visual mapping) · `src/hooks/useSimulation.js` · `src/components` (diagrams, controls, dashboard, graphs, panels, experiment) · `src/data/defaultParameters.js` · `tests/` · `docs/PHYSICS_MODEL.md` · `.github/workflows/deploy.yml`.

## Screenshots
_Placeholders: `docs/screenshots/simulator.png`, `docs/screenshots/threshold.png` (not yet captured)._

## References (standard editions; check details before citing)
A. E. Siegman, *Lasers*, University Science Books, 1986. · O. Svelto, *Principles of Lasers*, 5th ed., Springer, 2010. · W. T. Silfvast, *Laser Fundamentals*, 2nd ed., Cambridge University Press, 2004. · L. A. Coldren, S. W. Corzine, M. L. Mašanović, *Diode Lasers and Photonic Integrated Circuits*, 2nd ed., Wiley, 2012 (rate equations with Γ).

## Limitations and assumptions
Lumped single-mode model, equal degeneracies, no spatial hole burning, thermal effects or pump saturation beyond n0 depletion; lifetimes compressed from real µs–ms values; cavity loss is one total rate (no αi/αm split); three-level comparison has bars and graphs but no level diagram; the visual photon count uses a logarithmic display scale; animation speeds are display scales. Graphs are SVG, not Plotly; modules are tabs on one page, not separate pages. Layout was reviewed by CSS inspection and DOM tests only, not on physical devices. Spontaneous-vs-stimulated emission is state-driven (with a seed-photon trigger), not an event-by-event simulation.

## Future work
Plotly graphs, αi/αm split, Q-switching/relaxation-oscillation module, real material presets, level diagram for the three-level model, screenshots, browser end-to-end tests.

## License
MIT (see `LICENSE`).
