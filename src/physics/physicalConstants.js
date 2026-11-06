export const h = 6.62607015e-34; // J s
export const c = 299792458;      // m/s
export const eV = 1.602176634e-19; // J
/** Photon energy (eV) for wavelength in nm: E = h c / λ */
export const photonEnergyEV = (nm) => (h * c) / (nm * 1e-9) / eV;
