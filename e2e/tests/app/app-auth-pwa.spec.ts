import { test, expect } from '@playwright/test';
import { E2E_BASE_URL, E2E_PREMIER_URL } from '../../playwright.config';

test.describe('Feature 3: Next.js Auth Layout and Redirects (/auth)', () => {

  // Test 3.1: Redirect unauthenticated user from protected root page
  test('should redirect unauthenticated users from protected root / to /auth', async ({ page }) => {
    await page.goto('/');
    // Expect URL to redirect to /auth
    await expect(page).toHaveURL(/\/auth$/);
  });

  // Test 3.2: Redirect unauthenticated user from protected /space subpage
  test('should redirect unauthenticated users from protected /space to /auth', async ({ page }) => {
    await page.goto('/space');
    // Expect URL to redirect to /auth
    await expect(page).toHaveURL(/\/auth$/);
  });

  // Test 3.3: Verify /auth page layout text elements
  test('should render the authentication layout cards and headings correctly', async ({ page }) => {
    await page.goto('/auth');

    // Expect layout heading to be visible
    const heading = page.getByRole('heading', { name: /Authentication Required/i });
    await expect(heading).toBeVisible();

    // Expect description paragraph to be visible
    const description = page.locator('text=Please connect your wallet and sign the message');
    await expect(description).toBeVisible();
  });

  // Test 3.4: Verify the presence of RainbowKit Connect Wallet Button
  test('should render the Connect Button in the center of the auth card', async ({ page }) => {
    await page.goto('/auth');

    // Expect the Connect Wallet button to be visible
    const connectBtn = page.getByRole('button', { name: /Sign In with Wallet|Connect Wallet/i });
    await expect(connectBtn).toBeVisible();
  });

  // Test 3.5: Verify the "Back to Home" navigation element
  test('should render the back to home button and navigate when clicked', async ({ page }) => {
    await page.goto('/auth');

    const backBtn = page.getByRole('button', { name: /Back to Home/i });
    await expect(backBtn).toBeVisible();

    // Click the button; since user is unauthenticated, it routes to / and redirects back to /auth
    await backBtn.click();
    await expect(page).toHaveURL(/\/auth$/);
  });
});

test.describe('Feature 7: Progressive Web App (PWA) Support', () => {

  test.describe('y8-app PWA Integration', () => {
    // Test 7.1: y8-app manifest.json validation
    test('should serve a valid web manifest file', async ({ request }) => {
      const res = await request.get(`${E2E_BASE_URL}/manifest.json`);
      expect(res.status()).toBe(200);
      
      const manifest = await res.json();
      expect(manifest.name).toBeDefined();
      expect(manifest.short_name).toBeDefined();
      expect(manifest.start_url).toBeDefined();
      expect(manifest.display).toBe('standalone');
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    // Test 7.2: y8-app service worker registration
    test('should register service worker in page context', async ({ page }) => {
      await page.goto(E2E_BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check navigator.serviceWorker registry
      const swRegistration = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          return registrations.length > 0;
        }
        return false;
      });

      expect(swRegistration).toBe(true);
    });

    // Test 7.3: y8-app custom install banner
    test('should capture beforeinstallprompt and show custom install UI', async ({ page }) => {
      await page.goto(E2E_BASE_URL);
      await page.waitForLoadState('networkidle');

      // 1. Simulate the beforeinstallprompt event trigger
      await page.evaluate(() => {
        const installEvent = new Event('beforeinstallprompt') as any;
        installEvent.prompt = () => {
          (window as any).__pwa_prompt_called = true;
          return Promise.resolve({ outcome: 'accepted' });
        };
        window.dispatchEvent(installEvent);
      });

      // 2. Verify that the custom install button is rendered on the page
      const installButton = page.locator('#pwa-install-btn');
      await expect(installButton).toBeVisible();

      // 3. Click the custom install button
      await installButton.click();

      // 4. Assert that the browser prompt was triggered
      const promptTriggered = await page.evaluate(() => (window as any).__pwa_prompt_called === true);
      expect(promptTriggered).toBe(true);
    });
  });

  test.describe('y8-premier PWA Integration', () => {
    // Test 7.4: y8-premier manifest.json validation
    test('should serve a valid web manifest file', async ({ request }) => {
      const res = await request.get(`${E2E_PREMIER_URL}/manifest.json`);
      expect(res.status()).toBe(200);
      
      const manifest = await res.json();
      expect(manifest.name).toBeDefined();
      expect(manifest.short_name).toBeDefined();
      expect(manifest.start_url).toBeDefined();
      expect(manifest.display).toBe('standalone');
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    // Test 7.5: y8-premier service worker registration
    test('should register service worker in page context', async ({ page }) => {
      await page.goto(E2E_PREMIER_URL);
      await page.waitForLoadState('networkidle');

      // Check navigator.serviceWorker registry
      const swRegistration = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          return registrations.length > 0;
        }
        return false;
      });

      expect(swRegistration).toBe(true);
    });

    // Test 7.6: y8-premier custom install banner
    test('should capture beforeinstallprompt and show custom install UI', async ({ page }) => {
      await page.goto(E2E_PREMIER_URL);
      await page.waitForLoadState('networkidle');

      // 1. Simulate the beforeinstallprompt event trigger
      await page.evaluate(() => {
        const installEvent = new Event('beforeinstallprompt') as any;
        installEvent.prompt = () => {
          (window as any).__pwa_prompt_called = true;
          return Promise.resolve({ outcome: 'accepted' });
        };
        window.dispatchEvent(installEvent);
      });

      // 2. Verify that the custom install button is rendered on the page
      const installButton = page.locator('#pwa-install-btn');
      await expect(installButton).toBeVisible();

      // 3. Click the custom install button
      await installButton.click();

      // 4. Assert that the browser prompt was triggered
      const promptTriggered = await page.evaluate(() => (window as any).__pwa_prompt_called === true);
      expect(promptTriggered).toBe(true);
    });
  });
});
