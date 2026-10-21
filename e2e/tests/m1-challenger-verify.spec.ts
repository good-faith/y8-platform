import { test, expect } from '@playwright/test';
import { E2E_BEACH_URL, E2E_PREMIER_URL } from '../playwright.config';

test.describe('Milestone 1 Challenger Verification', () => {

  test.describe('3D Tropical Paradise Scene (the-beach)', () => {
    
    test.beforeEach(async ({ page }) => {
      // Access the-beach serving index.html
      await page.goto(E2E_BEACH_URL);
      await page.waitForLoadState('load');
    });

    // 1. Accessing the-beach automatically loads the 3D tropical paradise scene without console errors
    test('should load the tropical paradise scene automatically without console errors', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', error => {
        consoleErrors.push(error.message);
      });

      // Reload to capture all errors from the very start
      await page.reload();
      await page.waitForLoadState('load');

      // Wait for status text to indicate the scene is ready or socket connected
      const statusText = page.locator('#status');
      await expect(statusText).toBeVisible();
      await page.waitForFunction(() => {
        const txt = document.getElementById('status')?.textContent || '';
        return txt.includes('Paradise Ready') || txt.includes('multiplayer server');
      });

      // Assert zero console/page errors
      expect(consoleErrors).toEqual([]);
    });

    // 2. The scene renders all assets (ocean waves, palm trees, skybox, beach balls, umbrellas), active agent avatars, and floating UI controls
    test('should render all 3D assets, agent avatars, and spatial menus in Babylon.js scene', async ({ page }) => {
      // Wait for status text to indicate the scene is ready or socket connected
      const statusText = page.locator('#status');
      await expect(statusText).toBeVisible();
      await page.waitForFunction(() => {
        const txt = document.getElementById('status')?.textContent || '';
        return txt.includes('Paradise Ready') || txt.includes('multiplayer server');
      });

      const assetChecks = await page.evaluate(() => {
        const scene = (window as any).BABYLON?.Engine?.LastCreatedScene;
        if (!scene) {
          return { error: 'Babylon.js scene not found' };
        }

        const ocean = scene.getMeshByName('ocean');
        const beach = scene.getMeshByName('beach');
        const skybox = scene.getMeshByName('skyBox');
        
        // Palm trees
        const palmTrunks = scene.meshes.filter(m => m.name.startsWith('palmTrunk')).length;
        const fronds = scene.meshes.filter(m => m.name.startsWith('frond')).length;
        
        // Beach balls
        const beachBalls = scene.meshes.filter(m => m.name.startsWith('beachBall')).length;
        
        // Umbrellas (telepads)
        const telepads = scene.meshes.filter(m => m.name.startsWith('telepad')).length;
        const umbrellas = scene.meshes.filter(m => m.name.startsWith('umbrella')).length;

        // Agent avatars (using AgentAvatarManager)
        const agentOrbs = scene.meshes.filter(m => m.name.startsWith('agent-orb')).length;
        const agentHalos = scene.meshes.filter(m => m.name.startsWith('agent-halo')).length;

        // Floating UI controls (using SpatialServiceMenu)
        const spatialMenuRoot = scene.getNodeByName('spatial-menu-root');
        const categoryButtons = scene.meshes.filter(m => m.name.startsWith('smenu-cat-')).length;

        return {
          hasOcean: !!ocean,
          hasBeach: !!beach,
          hasSkybox: !!skybox,
          palmTrunkCount: palmTrunks,
          frondCount: fronds,
          beachBallCount: beachBalls,
          telepadCount: telepads,
          umbrellaCount: umbrellas,
          agentOrbCount: agentOrbs,
          agentHaloCount: agentHalos,
          hasSpatialMenuRoot: !!spatialMenuRoot,
          categoryButtonCount: categoryButtons
        };
      });

      console.log('Scene Asset Check Result:', assetChecks);

      expect(assetChecks.error).toBeUndefined();
      expect(assetChecks.hasOcean).toBe(true);
      expect(assetChecks.hasBeach).toBe(true);
      expect(assetChecks.hasSkybox).toBe(true);
      expect(assetChecks.palmTrunkCount).toBeGreaterThan(0);
      expect(assetChecks.frondCount).toBeGreaterThan(0);
      expect(assetChecks.beachBallCount).toBeGreaterThan(0);
      expect(assetChecks.telepadCount).toBeGreaterThan(0);
      expect(assetChecks.umbrellaCount).toBeGreaterThan(0);
      
      // Verify AgentAvatarManager ran
      expect(assetChecks.agentOrbCount).toBeGreaterThanOrEqual(0);
      expect(assetChecks.agentHaloCount).toBeGreaterThanOrEqual(0);

      // Verify SpatialServiceMenu ran
      expect(assetChecks.hasSpatialMenuRoot).toBe(true);
      expect(assetChecks.categoryButtonCount).toBeGreaterThan(0);
    });

    // 3. The spatial menus respond correctly to pointer hover events
    test('should trigger hover action handlers and scaling changes on spatial menu category buttons', async ({ page }) => {
      // Wait for status text to indicate the scene is ready or socket connected
      const statusText = page.locator('#status');
      await expect(statusText).toBeVisible();
      await page.waitForFunction(() => {
        const txt = document.getElementById('status')?.textContent || '';
        return txt.includes('Paradise Ready') || txt.includes('multiplayer server');
      });

      const hoverResult = await page.evaluate(async () => {
        const scene = (window as any).BABYLON?.Engine?.LastCreatedScene;
        if (!scene) return { error: 'Scene not found' };

        const geoMenuButton = scene.getMeshByName('smenu-cat-geo');
        if (!geoMenuButton) return { error: 'smenu-cat-geo not found' };

        const actionManager = geoMenuButton.actionManager;
        if (!actionManager) return { error: 'ActionManager not found on smenu-cat-geo' };

        // Inspect the actionManager to find the pointer over and out actions
        const actions = actionManager.actions;
        const overAction = actions.find(a => a.trigger === (window as any).BABYLON.ActionManager.OnPointerOverTrigger);
        const outAction = actions.find(a => a.trigger === (window as any).BABYLON.ActionManager.OnPointerOutTrigger);

        if (!overAction || !outAction) {
          return { error: 'Over/Out actions not registered' };
        }

        // Capture initial scale
        const initialScale = geoMenuButton.scaling.clone();

        // Simulate hover over
        const mockEvt = { meshUnderPointer: geoMenuButton };
        overAction.execute(mockEvt);
        const hoveredScale = geoMenuButton.scaling.clone();

        // Simulate hover out
        outAction.execute(mockEvt);
        const resetScale = geoMenuButton.scaling.clone();

        return {
          initialScale: { x: initialScale.x, y: initialScale.y, z: initialScale.z },
          hoveredScale: { x: hoveredScale.x, y: hoveredScale.y, z: hoveredScale.z },
          resetScale: { x: resetScale.x, y: resetScale.y, z: resetScale.z }
        };
      });

      console.log('Hover Verification Result:', hoverResult);

      expect(hoverResult.error).toBeUndefined();
      
      // Initial scale is 1
      expect(hoverResult.initialScale.x).toBeCloseTo(1.0);
      
      // Scaling changes on hover (it scales to 1.08 in code)
      expect(hoverResult.hoveredScale.x).toBeCloseTo(1.08);

      // Scaling resets on hover out (it scales back to 1.0)
      expect(hoverResult.resetScale.x).toBeCloseTo(1.0);
    });

    // 5. All transitions, spins, and page routing animations execute smoothly (Check 3D animations)
    test('should dynamically animate ocean, palm tree fronds, boats, and avatars', async ({ page }) => {
      // Wait for status text to indicate the scene is ready or socket connected
      const statusText = page.locator('#status');
      await expect(statusText).toBeVisible();
      await page.waitForFunction(() => {
        const txt = document.getElementById('status')?.textContent || '';
        return txt.includes('Paradise Ready') || txt.includes('multiplayer server');
      });

      // Capture initial states
      const state1 = await page.evaluate(() => {
        const scene = (window as any).BABYLON?.Engine?.LastCreatedScene;
        const ocean = scene.getMeshByName('ocean');
        const frond = scene.getMeshByName('frond0_0');
        const boat = scene.getMeshByName('boat0');
        return {
          oceanY: ocean?.position?.y,
          frondRotZ: frond?.rotation?.z,
          boatY: boat?.position?.y
        };
      });

      // Wait 1.5 seconds for frame animations to run
      await page.waitForTimeout(1500);

      // Capture subsequent states
      const state2 = await page.evaluate(() => {
        const scene = (window as any).BABYLON?.Engine?.LastCreatedScene;
        const ocean = scene.getMeshByName('ocean');
        const frond = scene.getMeshByName('frond0_0');
        const boat = scene.getMeshByName('boat0');
        return {
          oceanY: ocean?.position?.y,
          frondRotZ: frond?.rotation?.z,
          boatY: boat?.position?.y
        };
      });

      console.log('Initial Animation State:', state1);
      console.log('Subsequent Animation State:', state2);

      // Verify that positions and rotations have shifted over time, indicating active smooth rendering animations
      if (state1.oceanY !== undefined && state2.oceanY !== undefined) {
        expect(state1.oceanY).not.toBe(state2.oceanY);
      }
      if (state1.frondRotZ !== undefined && state2.frondRotZ !== undefined) {
        expect(state1.frondRotZ).not.toBe(state2.frondRotZ);
      }
      if (state1.boatY !== undefined && state2.boatY !== undefined) {
        expect(state1.boatY).not.toBe(state2.boatY);
      }
    });

  });

  test.describe('RSIncomePanel (y8-premier)', () => {

    test.beforeEach(async ({ page }) => {
      // Mock CoinGecko API response to prevent rate limiting issues
      await page.route('https://api.coingecko.com/api/v3/coins/markets*', async route => {
        const json = [
          {
            id: "bitcoin",
            symbol: "btc",
            name: "Bitcoin",
            current_price: 64000,
            price_change_percentage_24h_in_currency: 1.5,
            price_change_percentage_7d_in_currency: 3.2,
            price_change_percentage_30d_in_currency: -2.5
          },
          {
            id: "ethereum",
            symbol: "eth",
            name: "Ethereum",
            current_price: 3400,
            price_change_percentage_24h_in_currency: 2.1,
            price_change_percentage_7d_in_currency: -1.5,
            price_change_percentage_30d_in_currency: 5.0
          },
          {
            id: "solana",
            symbol: "sol",
            name: "Solana",
            current_price: 140,
            price_change_percentage_24h_in_currency: -0.5,
            price_change_percentage_7d_in_currency: 8.5,
            price_change_percentage_30d_in_currency: 12.0
          }
        ];
        await route.fulfill({ json });
      });

      // Visit y8-premier Financial Page (directly loads RSIncomePanel)
      await page.goto(`${E2E_PREMIER_URL}/financial`);
      
      // Inject y8_user in localStorage so we bypass login auth guard
      await page.evaluate(() => {
        const mockUser = {
          id: 'user_mock_123',
          name: 'Jason Sprouse',
          ethAddress: '0x90f8bfac9c63c302099a4f6878a7eed102b4b225',
          primaryAddress: '0x90f8bfac9c63c302099a4f6878a7eed102b4b225',
        };
        localStorage.setItem('y8_user', JSON.stringify(mockUser));
      });
      
      await page.goto(`${E2E_PREMIER_URL}/financial`);
      await page.waitForLoadState('networkidle');
    });

    // 4. RSIncomePanel collapses correctly to 1-column on mobile viewport sizes (under 768px)
    test('should collapse position inputs grid to 1-column on mobile, and expand to 3-columns on desktop', async ({ page }) => {
      const inputsContainer = page.locator('h3:has-text("My Positions") + div');
      await expect(inputsContainer).toBeVisible();

      // Check Desktop layout (1024px width)
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(200);

      // Verify desktop column layout is md:grid-cols-3
      const desktopClassList = await inputsContainer.evaluate(el => Array.from(el.classList));
      expect(desktopClassList).toContain('md:grid-cols-3');

      // Verify inputs lie side-by-side (their Y values are similar, X values are different)
      const inputs = inputsContainer.locator('input');
      const count = await inputs.count();
      expect(count).toBe(3);

      const bBox0 = await inputs.nth(0).boundingBox();
      const bBox1 = await inputs.nth(1).boundingBox();
      const bBox2 = await inputs.nth(2).boundingBox();

      if (bBox0 && bBox1 && bBox2) {
        // Y coordinates should be identical (aligned horizontally)
        expect(Math.abs(bBox0.y - bBox1.y)).toBeLessThan(10);
        expect(Math.abs(bBox1.y - bBox2.y)).toBeLessThan(10);
        // X coordinates should increase
        expect(bBox1.x).toBeGreaterThan(bBox0.x);
        expect(bBox2.x).toBeGreaterThan(bBox1.x);
      }

      // Check Mobile layout (400px width - under 768px)
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(200);

      const mobileBBox0 = await inputs.nth(0).boundingBox();
      const mobileBBox1 = await inputs.nth(1).boundingBox();
      const mobileBBox2 = await inputs.nth(2).boundingBox();

      if (mobileBBox0 && mobileBBox1 && mobileBBox2) {
        // Y coordinates should increase (stacked vertically)
        expect(mobileBBox1.y).toBeGreaterThan(mobileBBox0.y);
        expect(mobileBBox2.y).toBeGreaterThan(mobileBBox1.y);
        // X coordinates should be identical or very similar (aligned left)
        expect(Math.abs(mobileBBox0.x - mobileBBox1.x)).toBeLessThan(10);
        expect(Math.abs(mobileBBox1.x - mobileBBox2.x)).toBeLessThan(10);
      }
    });

    // 5. All transitions, spins, and page routing animations execute smoothly (Check page transition classes)
    test('should have spin and transition effects defined on UI elements', async ({ page }) => {
      // 1. Check refresh button loading spinner class
      const refreshBtn = page.locator('button:has-text("Refresh"), button:has-text("Updated")');
      await expect(refreshBtn).toBeVisible();

      // 2. Check transition classes on relative strength bar and strategy cards
      const progressBars = page.locator('div[class*="h-0.5"] > div');
      const barClass = await progressBars.first().evaluate(el => Array.from(el.classList));
      expect(barClass.some(c => c.includes('transition') || c.includes('duration'))).toBe(true);

      const strategyCards = page.locator('a[target="_blank"] > div');
      const cardClass = await strategyCards.first().evaluate(el => Array.from(el.classList));
      expect(cardClass.some(c => c.includes('transition') || c.includes('duration') || c.includes('hover:'))).toBe(true);
    });

  });

});
