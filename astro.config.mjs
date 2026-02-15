// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import node from '@astrojs/node';
import db from '@astrojs/db';

// Load .env files into process.env for SSR
const {
  EDITOR_ADMIN,
  EDITOR_PASSWORD,
  GOOGLE_GEMINI_API_KEY,
  GOOGLE_GEMINI_MODELS,
} = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
Object.assign(process.env, {
  EDITOR_ADMIN,
  EDITOR_PASSWORD,
  GOOGLE_GEMINI_API_KEY,
  GOOGLE_GEMINI_MODELS,
});

// Start auto-publisher in production (standalone Node server)
if (process.env.NODE_ENV === 'production') {
  import('./src/services/AutoPublisher.js').then(({ startAutoPublisher }) => {
    startAutoPublisher();
  }).catch((err) => {
    console.error('[AutoPublisher] Failed to start:', err);
  });
}

// https://astro.build/config
export default defineConfig({
  site: 'https://semantik-html-barrierefrei.de',
  integrations: [react(), db()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
