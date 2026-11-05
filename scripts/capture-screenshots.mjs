/**
 * Captures the screenshots used by docs/user-guide.md and the slide deck.
 *
 *   1. npx next dev -H 0.0.0.0 -p 3000
 *   2. NODE_PATH=<playwright node_modules> node scripts/capture-screenshots.mjs docs/screenshots
 */
import fs from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const OUT = process.argv[2] ?? "docs/screenshots";
const WIDTH = 1440;
const HEIGHT = 950;

fs.mkdirSync(OUT, { recursive: true });

const HIDE_DEV_OVERLAY = `nextjs-portal { display: none !important; }`;

async function settle(page, ms = 500) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

async function shot(page, name, options = {}) {
  await settle(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, ...options });
  console.log("saved", name);
}

async function signIn(page, email, password, expect) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    // Wait for the client component to hydrate, otherwise the form does a
    // native GET submit instead of calling the login API.
    await settle(page, 1200);
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL(expect, { timeout: 20000 });
      await settle(page, 800);
      return;
    } catch (error) {
      console.log(`sign in attempt ${attempt} failed, retrying`);
    }
  }
  throw new Error(`Could not sign in as ${email}`);
}

async function signOut(page) {
  await page.click('button:has-text("Sign out")');
  await page.waitForURL(`${BASE}/`, { timeout: 20000 });
  await settle(page, 300);
}

async function pickAdjacentNights(page) {
  const days = page.locator("button[aria-pressed]");
  const count = await days.count();
  const usable = [];
  for (let index = 0; index < count; index += 1) {
    const button = days.nth(index);
    const label = (await button.getAttribute("aria-label")) || "";
    if ((await button.isEnabled()) && !label.includes("unavailable")) {
      usable.push(index);
    }
  }
  for (let i = 0; i < usable.length - 1; i += 1) {
    if (usable[i + 1] === usable[i] + 1) {
      await days.nth(usable[i]).click();
      await days.nth(usable[i + 1]).click();
      await page.waitForTimeout(500);
      return true;
    }
  }
  return false;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Signed-out pages
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await shot(page, "01-home");

  await page.goto(`${BASE}/properties`, { waitUntil: "domcontentloaded" });
  await shot(page, "02-properties");

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await shot(page, "03-sign-in");

  // Guest journey
  await signIn(page, "guest@plumguide.com", "Guest123!", "**/dashboard/guest");
  await page.goto(`${BASE}/properties`, { waitUntil: "domcontentloaded" });
  await page.locator('a[href^="/properties/"]').first().click();
  await page.waitForURL(/\/properties\/[^/]+$/);
  await settle(page, 700);
  await shot(page, "04-property-detail");

  const widget = page.locator("div.card.overflow-hidden.shadow-lift").first();
  await widget.scrollIntoViewIfNeeded();
  const picked = await pickAdjacentNights(page);
  console.log("dates selected:", picked);
  await shot(page, "05-booking-widget", { clip: await widget.boundingBox() });

  await Promise.all([
    page.waitForURL(/\/bookings\/[^/]+\/confirmation$/, { timeout: 30000 }),
    page.click('button:has-text("Confirm & Pay")'),
  ]);
  await settle(page, 800);
  const bookingId = page.url().split("/").slice(-2)[0];
  await shot(page, "06-confirmation");

  await page.goto(`${BASE}/dashboard/guest`, { waitUntil: "domcontentloaded" });
  await shot(page, "07-guest-dashboard");

  await page.locator('button:has-text("Cancel reservation")').first().click();
  await page.waitForTimeout(700);
  await shot(page, "08-cancel-dialog");
  await page.keyboard.press("Escape");

  await page.goto(`${BASE}/bookings/${bookingId}/invoice`, {
    waitUntil: "domcontentloaded",
  });
  await shot(page, "09-invoice");
  await signOut(page);

  // Host journey
  await signIn(page, "host@plumguide.com", "Host123!", "**/dashboard/host");
  await shot(page, "10-host-dashboard");
  await page.locator('a:has-text("Manage calendar")').first().click();
  await page.waitForURL(/\/dashboard\/host\/properties\/[^/]+$/);
  await settle(page, 900);
  await shot(page, "11-host-calendar");
  await signOut(page);

  // Specialist and admin
  await signIn(
    page,
    "specialist@plumguide.com",
    "Specialist123!",
    "**/dashboard/specialist"
  );
  await shot(page, "12-specialist-dashboard");
  await signOut(page);

  await signIn(page, "admin@plumguide.com", "Admin123!", "**/dashboard/admin");
  await shot(page, "13-admin-dashboard");

  await browser.close();
})().catch((error) => {
  console.error("CAPTURE_FAILED", error);
  process.exit(1);
});
