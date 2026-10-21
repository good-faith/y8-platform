import { test, expect } from '@playwright/test';
import { E2E_BASE_URL, E2E_PREMIER_URL, E2E_BEACH_URL } from '../../playwright.config.js';
import { encode } from 'next-auth/jwt';
import { Wallet } from 'ethers';

// Helper to generate next-auth session token cookie
async function createNextAuthCookie(walletAddress: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-do-not-use-in-production';
  const token = await encode({
    token: {
      sub: walletAddress,
      address: walletAddress,
      y8Token: 'mock-y8-token-123',
      y8User: {
        id: 'user_mock_123',
        walletAddress: walletAddress,
        tier: 'free',
        role: 'user',
        createdAt: Date.now(),
      },
    },
    secret,
  });
  return {
    name: 'next-auth.session-token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  };
}

const wallet = Wallet.createRandom();
const walletAddress = wallet.address.toLowerCase();

async function generateSIWERecords(w: Wallet) {
  const domain = 'localhost:3000';
  const uri = 'http://localhost:3000';
  const nonce = '12345678';
  const issuedAt = new Date().toISOString();
  
  const message = `${domain} wants you to sign in with your Ethereum account:
${w.address}

Sign in with Ethereum to access your premier services

URI: ${uri}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${issuedAt}`;

  const signature = await w.signMessage(message);
  return { message, signature };
}

test.describe('Feature 5: Session Persistence & Cross-App Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept CDN script requests and fulfill with empty body to avoid network hangs
    await page.route('**/*', (route: any) => {
      const url = route.request().url();
      if (
        url.includes('babylonjs.com') ||
        url.includes('socket.io') ||
        url.includes('soundcloud.com')
      ) {
        route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: '',
        });
      } else {
        route.continue();
      }
    });

    // Inject mocks for BABYLON, SC, and io globals
    await page.addInitScript(() => {
      // Mock window.SC
      const WidgetMock = function(iframe: any) {
        return {
          bind: function(event: any, cb: any) {
            if (event === 'ready') setTimeout(cb, 10);
            if (event === 'play') { (this as any)._onPlay = cb; }
            if (event === 'pause') { (this as any)._onPause = cb; }
          },
          setVolume: function(volume?: any) {},
          play: function() { if ((this as any)._onPlay) (this as any)._onPlay(); },
          pause: function() { if ((this as any)._onPause) (this as any)._onPause(); },
        };
      };
      (WidgetMock as any).Events = { READY: 'ready', PLAY: 'play', PAUSE: 'pause' };
      (window as any).SC = { Widget: WidgetMock };

      // Mock io
      (window as any).io = () => ({
        on: (event: any, cb: any) => {},
        emit: (event: any, ...args: any[]) => {},
      });

      // Mock BABYLON
      class mockVector3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number) {
          this.x = x || 0;
          this.y = y || 0;
          this.z = z || 0;
        }
        static Zero() { return new mockVector3(0, 0, 0); }
        static Up() { return new mockVector3(0, 1, 0); }
        static Distance(v1: any, v2: any) {
          return Math.sqrt(
            Math.pow((v1?.x || 0) - (v2?.x || 0), 2) +
            Math.pow((v1?.y || 0) - (v2?.y || 0), 2) +
            Math.pow((v1?.z || 0) - (v2?.z || 0), 2)
          );
        }
        clone() {
          return new mockVector3(this.x, this.y, this.z);
        }
        scale(s: number) {
          return new mockVector3(this.x * s, this.y * s, this.z * s);
        }
        add(other: any) {
          return new mockVector3(this.x + (other?.x || 0), this.y + (other?.y || 0), this.z + (other?.z || 0));
        }
      }

      class mockQuaternion {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number) {
          this.x = x || 0;
          this.y = y || 0;
          this.z = z || 0;
          this.w = w || 1;
        }
        static FromEulerAngles(x?: number, y?: number, z?: number) { return new mockQuaternion(0, 0, 0, 1); }
        static Dot(q1: any, q2: any) {
          return (q1?.x || 0) * (q2?.x || 0) +
                 (q1?.y || 0) * (q2?.y || 0) +
                 (q1?.z || 0) * (q2?.z || 0) +
                 (q1?.w || 1) * (q2?.w || 1);
        }
        clone() {
          return new mockQuaternion(this.x, this.y, this.z, this.w);
        }
      }

      const createMockMesh = () => ({
        position: new mockVector3(),
        rotation: new mockVector3(),
        scaling: { setAll: (val?: any) => {} },
        setPivotPoint: (point?: any) => {},
        setEnabled: (val?: any) => {},
        lookAt: (target?: any) => {},
        dispose: () => {},
        actionManager: null as any,
        parent: null as any,
        billboardMode: 0,
        isVisible: true,
        isPickable: false
      });

      class mockActionManager {
        constructor(scene?: any) {}
        registerAction(action?: any) {}
      }
      (mockActionManager as any).OnPointerOverTrigger = 1;
      (mockActionManager as any).OnPointerOutTrigger = 2;
      (mockActionManager as any).OnPickTrigger = 3;

      class mockExecuteCodeAction {
        constructor(triggerOptions?: any, callback?: any, condition?: any) {}
      }

      (window as any).BABYLON = {
        Engine: class {
          constructor(canvas?: any, anticlockwise?: any, options?: any, adaptToDeviceRatio?: any) {}
          runRenderLoop(fn: any) { (this as any)._loop = fn; setTimeout(() => { if ((this as any)._loop) (this as any)._loop(); }, 100); }
          resize() {}
          dispose() {}
        },
        Scene: class {
          constructor(engine?: any, options?: any) {
            (this as any).activeCamera = {};
          }
          registerBeforeRender(cb: any) {
            setTimeout(cb, 50);
          }
          render() {}
          getMeshByName(name?: any) { return createMockMesh(); }
          createDefaultXRExperienceAsync() {
            return Promise.resolve({
              baseExperience: {
                state: 0,
                enterXRAsync: () => Promise.resolve(),
                exitXRAsync: () => Promise.resolve()
              }
            });
          }
        },
        UniversalCamera: class {
          constructor(name?: any, position?: any, scene?: any) {
            (this as any).position = new mockVector3(0, 5, 15);
            (this as any).rotation = new mockVector3(0, 0, 0);
            (this as any).inputs = { addGamepad: () => {} };
          }
          setTarget(target?: any) {}
          attachControl(element?: any, noPreventDefault?: any) {}
          getForwardRay(length: number) {
            return {
              direction: new mockVector3(0, 0, -1)
            };
          }
        },
        HemisphericLight: class {
          constructor(name?: any, direction?: any, scene?: any) {}
        },
        DirectionalLight: class {
          constructor(name?: any, direction?: any, scene?: any) {}
        },
        PointLight: class {
          constructor(name?: any, position?: any, scene?: any) {}
        },
        Vector3: mockVector3,
        Quaternion: mockQuaternion,
        StandardMaterial: class {
          constructor(name?: any, scene?: any) {}
        },
        Color3: class {
          constructor(r?: any, g?: any, b?: any) {}
        },
        DynamicTexture: class {
          constructor(name?: any, options?: any, scene?: any, generateMipMaps?: any) {}
          getContext() {
            return {
              createLinearGradient: (x0?: any, y0?: any, x1?: any, y1?: any) => ({ addColorStop: (offset?: any, color?: any) => {} }),
              fillRect: (x?: any, y?: any, w?: any, h?: any) => {},
            };
          }
          update(invertY?: any, preorder?: any) {}
        },
        CreateBox: (name?: any, options?: any, scene?: any) => createMockMesh(),
        CreateGround: (name?: any, options?: any, scene?: any) => createMockMesh(),
        CreateCylinder: (name?: any, options?: any, scene?: any) => createMockMesh(),
        CreateSphere: (name?: any, options?: any, scene?: any) => createMockMesh(),
        MeshBuilder: {
          CreateSphere: (name?: any, options?: any, scene?: any) => createMockMesh(),
          CreateTorus: (name?: any, options?: any, scene?: any) => createMockMesh(),
          CreatePlane: (name?: any, options?: any, scene?: any) => createMockMesh(),
        },
        ActionManager: mockActionManager,
        ExecuteCodeAction: mockExecuteCodeAction,
        TransformNode: class {
          constructor(name: any, scene: any) {}
          setEnabled(val: boolean) {}
          lookAt(pos: any) {}
        },
        GlowLayer: class {
          constructor(name?: any, scene?: any) {}
          addIncludedOnlyMesh(mesh?: any) {}
        },
        WebXRSessionManager: {
          IsSessionSupportedAsync: (sessionType?: any) => Promise.resolve(false)
        },
        Mesh: {
          BILLBOARDMODE_ALL: 7
        },
        WebXRState: {
          IN_XR: 1
        },
        GUI: {
          AdvancedDynamicTexture: {
            CreateForMesh: (mesh?: any) => ({ addControl: (control?: any) => {} })
          },
          Rectangle: class {
            constructor(name?: any) {}
            addControl(control?: any) {}
          },
          StackPanel: class {
            constructor(name?: any) {}
            addControl(control?: any) {}
          },
          TextBlock: class {
            constructor(name?: any, text?: any) {}
            addControl(control?: any) {}
          },
          Control: {
            HORIZONTAL_ALIGNMENT_LEFT: 0
          }
        }
      };
    });
  });

  // Test 5.1: y8-app User Session Persistence
  test('y8-app session should persist after reload', async ({ context, page }) => {
    console.log('DEBUG URLs:', { E2E_BASE_URL, E2E_BEACH_URL, E2E_PREMIER_URL });
    // 1. Visit y8-app domain and set next-auth session cookie
    await page.goto(E2E_BASE_URL);
    const cookie = await createNextAuthCookie(walletAddress);
    await context.addCookies([cookie]);

    // 2. Go to home page (authenticated)
    await page.goto(E2E_BASE_URL);
    await page.waitForLoadState('load');

    // 3. Assert user is authenticated (Welcome back! dashboard element is visible)
    const heading = page.locator('text=Welcome back!');
    await expect(heading).toBeVisible();

    // 4. Reload page and assert auth persists
    await page.reload();
    await page.waitForLoadState('load');
    await expect(heading).toBeVisible();
  });

  // Test 5.2: y8-premier Session Persistence
  test('y8-premier session should persist after reload', async ({ page }) => {
    // 1. Visit y8-premier domain
    await page.goto(E2E_PREMIER_URL);

    // 2. Inject y8_user and y8_auth_sig in localStorage
    const { message, signature } = await generateSIWERecords(wallet);
    await page.evaluate(({ addr, message, signature }) => {
      const mockUser = {
        id: 'user_mock_123',
        name: `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`,
        ethAddress: addr,
        primaryAddress: addr,
      };
      localStorage.setItem('y8_user', JSON.stringify(mockUser));
      localStorage.setItem('y8_auth_sig', JSON.stringify({ message, signature }));
    }, { addr: walletAddress, message, signature });

    // 3. Reload page and verify user is recognized
    await page.reload();
    await page.waitForLoadState('load');

    // 4. Expect to not redirect to /auth and profile name to show
    await expect(page).not.toHaveURL(/\/auth$/);
    const profileName = page.locator('.truncate');
    await expect(profileName).toBeVisible();
  });

  // Test 5.3: the-beach Session Persistence
  test('the-beach session should persist after reload', async ({ page }) => {
    // 1. Visit the-beach main XR environment
    await page.goto(`${E2E_BEACH_URL}/xr`);

    // 2. Inject y8_token & y8_address in localStorage
    await page.evaluate((addr: string) => {
      localStorage.setItem('y8_token', 'mock-y8-token-123');
      localStorage.setItem('y8_address', addr);
    }, walletAddress);

    // 3. Reload page
    await page.reload();
    await page.waitForLoadState('load');

    // 4. Expect chain connector elements to display Y8 Authenticated status
    const y8Label = page.locator('#cc-y8-label');
    await expect(y8Label).toBeVisible();
    await expect(y8Label).toHaveText('Y8 Authenticated');
  });

  // Test 5.4: Shared Auto-Login from y8-app to y8-premier
  test('logging in to y8-app automatically logs in to y8-premier', async ({ context, page }) => {
    // 1. Visit y8-app and add session cookie
    await page.goto(E2E_BASE_URL);
    const cookie = await createNextAuthCookie(walletAddress);
    await context.addCookies([cookie]);

    // 2. Visit/reload y8-app page to trigger its AuthContext to run and write y8_user to local storage
    await page.goto(E2E_BASE_URL);
    await page.waitForLoadState('load');

    // 3. Navigate to y8-premier and assert that the user is authenticated (profile name visible, no redirect to /auth)
    await page.goto(E2E_PREMIER_URL);
    await page.waitForLoadState('load');

    // 4. Assert user is auto-logged in (no redirect to /auth)
    await expect(page).not.toHaveURL(/\/auth$/);
    const profileName = page.locator('.truncate');
    await expect(profileName).toBeVisible();
  });

  // Test 5.5: Shared Auto-Login from y8-premier to y8-app
  test('logging in to y8-premier automatically logs in to y8-app', async ({ page }) => {
    // 1. Visit y8-premier and write y8_user and y8_auth_sig to localStorage (simulating premier login)
    await page.goto(E2E_PREMIER_URL);
    const { message, signature } = await generateSIWERecords(wallet);
    await page.evaluate(({ addr, message, signature }) => {
      const mockUser = {
        id: 'user_mock_123',
        name: `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`,
        ethAddress: addr,
        primaryAddress: addr,
      };
      localStorage.setItem('y8_user', JSON.stringify(mockUser));
      localStorage.setItem('y8_auth_sig', JSON.stringify({ message, signature }));
    }, { addr: walletAddress, message, signature });

    // Trigger the session restoration and iframe sync by reloading
    await page.reload();
    await page.waitForLoadState('load');
    // Wait for postMessage authentication sync to complete
    await page.waitForTimeout(2000);

    // 2. Navigate to y8-app directly
    await page.goto(E2E_BASE_URL);
    await page.waitForLoadState('load');

    // 3. Assert user is recognized immediately (e.g., "Welcome back!" heading is visible) without the test manually adding any cookie.
    const heading = page.locator('text=Welcome back!');
    await expect(heading).toBeVisible();
  });

  // Test 5.6: Session Sync via postMessage to the-beach
  test('should synchronize session dynamically via window.postMessage on the-beach', async ({ page }) => {
    // 1. Visit the-beach main XR environment
    await page.goto(`${E2E_BEACH_URL}/xr`);
    await page.waitForLoadState('load');

    // 2. Trigger postMessage event
    await page.evaluate((addr: string) => {
      window.postMessage({
        type: 'Y8_AUTH',
        token: 'mock-token-postmessage-xyz',
        address: addr
      }, '*');
    }, walletAddress);

    // 3. Verify that the chain connector intercepts message and updates status
    const y8Label = page.locator('#cc-y8-label');
    await expect(y8Label).toBeVisible();
    await expect(y8Label).toHaveText('Y8 Authenticated');

    // 4. Verify that the credentials are written to the-beach local storage
    const storedToken = await page.evaluate(() => localStorage.getItem('y8_token'));
    expect(storedToken).toBe('mock-token-postmessage-xyz');
  });
});
