import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In the Base44 sandbox the preview is proxied through a public host whose
// sandbox id rotates, so we allow the whole sandbox domain (wildcard) instead
// of a fixed hostname. This only applies while BASE44_PREVIEW_MODE === '1';
// outside the sandbox the allowlist keeps Vite's defaults.
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts:
      process.env.BASE44_PREVIEW_MODE === '1' && sandboxHostDomain
        ? [`.${sandboxHostDomain}`]
        : undefined,
  },
});
