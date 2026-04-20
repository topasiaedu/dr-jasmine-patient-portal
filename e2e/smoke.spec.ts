import { test, expect } from "@playwright/test";

test.describe("Smoke — routing and public shells", () => {
  test("root and legacy /p/demo URLs redirect to patient setup (no session cookie)", async ({ page }) => {
    for (const path of ["/", "/p/demo", "/p/demo/home"]) {
      await page.goto(path, { waitUntil: "load" });
      await expect(page).toHaveURL(/\/p\/ghl-demo\/setup$/);
    }
  });

  test("legacy /p/demo deep path maps to /p/ghl-demo then setup without cookie", async ({ page }) => {
    await page.goto("/p/demo/guide", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/p\/ghl-demo\/setup$/);
  });

  test("patient setup page shows loading or outcome copy", async ({ page }) => {
    await page.goto("/p/ghl-demo/setup", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/p\/ghl-demo\/setup$/);
    await expect(
      page.getByText(
        /getting things ready|could not open your portal|Database error|Missing NEXT_PUBLIC_SUPABASE|Invalid link/i
      )
    ).toBeVisible({ timeout: 25_000 });
  });

  test("admin login page renders", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Dr\. Jasmine/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("textbox", { name: /^password$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("find-my-link page renders", async ({ page }) => {
    await page.goto("/find-my-link", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /find my link/i })).toBeVisible({ timeout: 10_000 });
  });
});
