import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `file://${path.resolve(__dirname, 'index.html')}`,
    headless: true,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
