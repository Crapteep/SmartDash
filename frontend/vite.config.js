import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  server: {
    host: '0.0.0.0'
  };
  return defineConfig({
    plugins: [react()],
  });
}

