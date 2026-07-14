import {defineConfig, devices} from '@playwright/test';

const DEV = (process.env.NODE_ENV ?? 'production') === 'development';

export default defineConfig({
  webServer: [
    {
      command: 'npm run build:e2e && npm run preview',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
    },
  ],
  testDir: './e2e',
  snapshotDir: `./${DEV ? 'tmp' : 'e2e'}/snapshots`,
  testMatch: ['**/*.e2e.ts', '**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: 1,
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    testIdAttribute: 'data-tid',
    baseURL: 'http://localhost:4173',
    trace: 'on',
    ...(DEV && {headless: false}),
    timezoneId: 'Europe/Zurich',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
});
