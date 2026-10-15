import { expect, test } from "@playwright/test";
import { createTestUser, deleteUser, signInTicket } from "./clerk";

test.describe("public site", () => {
  test("landing page shows the stack and pricing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("figure", { name: /stack/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Upgrade to Pro/ })).toBeVisible();
    await page.screenshot({ path: "test-results/screens/landing.png", fullPage: true });
  });

  test("pricing lists three plans", async ({ page }) => {
    await page.goto("/pricing");
    for (const name of ["Free", "Pro", "Team"]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  });

  test("dashboard requires sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe("signed-in app", () => {
  let user: { id: string; email: string };

  test.beforeAll(async () => {
    user = await createTestUser();
  });
  test.afterAll(async () => {
    if (user) await deleteUser(user.id);
  });

  test("sign in, add items, upgrade, open admin", async ({ page }) => {
    const ticket = await signInTicket(user.id);
    await page.goto(`/sign-in?__clerk_ticket=${ticket}`);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Hi, Avery/ })).toBeVisible({ timeout: 20_000 });

    for (const title of ["Write the launch post", "Record a demo"]) {
      await page.getByLabel("New item").fill(title);
      await page.getByRole("button", { name: "Add item" }).click();
      await expect(page.getByText(title)).toBeVisible();
    }
    await page.screenshot({ path: "test-results/screens/dashboard.png", fullPage: true });

    await page.getByRole("link", { name: "Billing" }).click();
    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    const upgrade = page.getByRole("button", { name: "Upgrade to Pro" });
    await expect(upgrade).toBeEnabled(); // enabled once Clerk has loaded the session
    await upgrade.click();
    const health = await (await page.request.get("/api/health")).json();
    if (health.integrations.billing.mode === "demo") {
      // Demo mode completes in-app.
      await expect(page.getByText("Upgrade complete")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/demo billing/)).toBeVisible();
      await page.screenshot({ path: "test-results/screens/billing.png", fullPage: true });
    } else {
      // Stripe and Polar redirect to their hosted checkout pages.
      await page.waitForURL(/checkout\.stripe\.com|polar\.sh/, { timeout: 20_000 });
      return;
    }

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
    await page.screenshot({ path: "test-results/screens/admin.png", fullPage: true });
  });
});
