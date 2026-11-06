import { useRef, useState, useEffect, useCallback } from 'react';
import { MODELS } from '../physics/models.js';
// Physical time (ns) advances in fixed RK4 sub-steps; the frame rate only decides how many run per frame
// (200 ns of physical time per real second at speed 1).
export function useSimulation(params, speed = 1, model = 'four') {
  const M = MODELS[model];
  const st = useRef({ y: M.init(), t: 0, hist: [], viol: 0 });
  const live = useRef({});
  Object.assign(live.current, { params, speed, M });
  const [, tick] = useState(0);
  const [running, setRunning] = useState(true);
  live.current.running = running;
  useEffect(() => {
    let raf, last = null;
    const loop = (now) => {
      const dtReal = last === null ? 0 : Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; // never negative
      const L = live.current;
      if (L.running) {
        const s = st.current, dtPhys = 200 * L.speed * dtReal, r = L.M.advance(s.y, L.params, dtPhys, 0.02);
        s.y = r.y; s.t += dtPhys; s.viol += r.violations;
        s.hist.push({ t: s.t, ...L.M.unpack(r.y) }); if (s.hist.length > 600) s.hist.shift();
      }
      tick((x) => x + 1); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  const reset = useCallback(() => { st.current = { y: live.current.M.init(), t: 0, hist: [], viol: 0 }; }, []);
  const inject = useCallback((S0) => { const i = live.current.M.sIndex; st.current.y = st.current.y.map((v, k) => (k === i ? v + S0 : v)); }, []);
  return { ...st.current, state: M.unpack(st.current.y), running, setRunning, reset, inject };
}
