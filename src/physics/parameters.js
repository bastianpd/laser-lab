// Parameter specification, validation and unit conversion. No React, no I/O.
// Units: time ns; sigma19 in 1e-19 cm^2; Ntot18 in 1e18 cm^-3; vg cm/ns; Wp 1/ns.
// `ui:true` entries are exposed as sliders. `normalized` marks illustrative (non-measured) values.
export const PARAM_SPEC = {
  Wp:      { min: 0,    max: 0.05, step: 0.0005, unit: '1/ns',      ui: true,  desc: 'Pump rate Wp: E0→E3 transition probability per ground-state atom' },
  tau32:   { min: 0.1,  max: 10,   step: 0.1,    unit: 'ns',        ui: true,  desc: 'Pump-level lifetime τ32: fast non-radiative decay E3→E2' },
  tauSp:   { min: 10,   max: 500,  step: 5,      unit: 'ns',        ui: true,  desc: 'Upper laser level lifetime τsp: metastable state, spontaneous decay E2→E1' },
  tau1:    { min: 0.1,  max: 10,   step: 0.1,    unit: 'ns',        ui: true,  desc: 'Lower-level lifetime τ1: fast decay E1→E0' },
  sigma19: { min: 0.5,  max: 10,   step: 0.1,    unit: '1e-19 cm²', ui: true,  desc: 'Cross-section σ: stimulated-emission cross-section' },
  Ntot18:  { min: 0.2,  max: 5,    step: 0.1,    unit: '1e18 cm⁻³', ui: true,  desc: 'Total density N_total: active atoms per volume' },
  tauC:    { min: 0.1,  max: 5,    step: 0.05,   unit: 'ns',        ui: true,  desc: 'Cavity photon lifetime τc: 1/τc = vg(αi+αm)' },
  gamma:   { min: 0.1,  max: 1,    step: 0.05,   unit: '',          ui: true,  desc: 'Confinement factor Γ: active volume / mode volume' },
  beta:    { min: 0,    max: 1e-3, step: 1e-6,   unit: '',          ui: false, desc: 'Spontaneous coupling βsp: fraction of spontaneous emission entering the mode' },
  vg:      { min: 1,    max: 30,   step: 0.5,    unit: 'cm/ns',     ui: false, desc: 'Group velocity vg = c/n_g' },
};
export const SIM_SPEC = { duration: { min: 100, max: 20000, unit: 'ns' }, dt: { min: 0.001, max: 0.1, unit: 'ns' } };

const MUST_BE_POSITIVE = ['tau32', 'tauSp', 'tau1', 'sigma19', 'Ntot18', 'tauC', 'vg'];
/** Returns {valid, errors}. enforceRange also applies the UI min/max from PARAM_SPEC. */
export function validateParams(p, { enforceRange = false } = {}) {
  const errors = [];
  for (const k of Object.keys(PARAM_SPEC)) if (!Number.isFinite(p[k])) errors.push(`${k} must be a finite number`);
  if (errors.length) return { valid: false, errors };
  for (const k of MUST_BE_POSITIVE) if (!(p[k] > 0)) errors.push(`${k} must be > 0`);
  if (!(p.Wp >= 0)) errors.push('Wp must be >= 0');
  if (!(p.gamma > 0 && p.gamma <= 1)) errors.push('gamma must be in (0, 1]');
  if (!(p.beta >= 0 && p.beta <= 1)) errors.push('beta must be in [0, 1]');
  if (enforceRange) for (const [k, s] of Object.entries(PARAM_SPEC)) if (p[k] < s.min || p[k] > s.max) errors.push(`${k} outside [${s.min}, ${s.max}] ${s.unit}`);
  return { valid: errors.length === 0, errors };
}
/** Converts scaled UI parameters to internal units (cm^2, cm^-3). Throws RangeError if unphysical. */
export function toInternal(p) {
  const v = validateParams(p);
  if (!v.valid) throw new RangeError('Invalid laser parameters: ' + v.errors.join('; '));
  return { ...p, sigma: p.sigma19 * 1e-19, Ntot: p.Ntot18 * 1e18 };
}
