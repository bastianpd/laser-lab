import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Relative base ('./') works on GitHub Pages under any repository name.
// Override with VITE_BASE=/repo-name/ if you prefer an absolute path.
export default defineConfig({ base: process.env.VITE_BASE || './', plugins: [react()], test: { include: ['tests/**/*.test.{js,jsx}'] } });
