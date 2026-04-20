import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a local Next server. When Supabase env vars are unset, middleware
 * skips admin session enforcement (see `middleware.ts`); patient `/p/*` still needs
 * `COOKIE_SECRET` for JWT verification when a session cookie is present.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    /** Dedicated port so `npm run test:e2e` works while `next dev` runs on 3000. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3005",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- -p 3005 -H 127.0.0.1",
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3005",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      COOKIE_SECRET:
        process.env.COOKIE_SECRET ??
        "e2e-test-cookie-secret-min-32-chars!!",
      PATIENT_COOKIE_SECURE: process.env.PATIENT_COOKIE_SECURE ?? "false",
      /**
       * Default Supabase local demo URL + keys (no running stack required). Routes return
       * JSON errors instead of throwing when env is absent; override with real `.env.local` for deeper tests.
       */
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_SERVICE_ROLE_KEY ??
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
    },
  },
});
