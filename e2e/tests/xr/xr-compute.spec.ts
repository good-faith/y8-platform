import { test, expect, APIRequestContext } from '@playwright/test';
import { io, Socket } from 'socket.io-client';
import { E2E_BEACH_URL, E2E_API_URL } from '../../playwright.config.js';
import { ethers } from 'ethers';

// Helper to obtain SIWE JWT from y8-server
async function getAuthToken(request: APIRequestContext, apiURL: string): Promise<string> {
  const wallet = ethers.Wallet.createRandom();
  
  // 1. Get nonce
  const nonceRes = await request.get(`${apiURL}/auth/nonce`);
  expect(nonceRes.status()).toBe(200);
  const { nonce } = await nonceRes.json();
  expect(nonce).toBeDefined();

  // 2. Format SIWE message
  const domain = 'localhost';
  const origin = 'http://localhost:3000';
  const address = await wallet.getAddress();
  const statement = 'Sign in with Ethereum to Y8 Platform.';
  const chainId = 84532; // Base Sepolia
  
  const message = `${domain} wants you to sign in with your Ethereum account:\n` +
    `${address}\n\n` +
    `${statement}\n\n` +
    `URI: ${origin}\n` +
    `Version: 1\n` +
    `Chain ID: ${chainId}\n` +
    `Nonce: ${nonce}\n` +
    `Issued At: ${new Date().toISOString()}`;

  // 3. Sign message
  const signature = await wallet.signMessage(message);

  // 4. Verify
  const verifyRes = await request.post(`${apiURL}/auth/siwe/verify`, {
    data: { message, signature }
  });
  expect(verifyRes.status()).toBe(200);
  const { accessToken } = await verifyRes.json();
  expect(accessToken).toBeDefined();
  
  return accessToken;
}

test.describe('Feature 2: XR Paradise Environment Info & Scene Loading', () => {

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

  // Test 2.1: API endpoint /xr/info verification
  test('should return 200 OK and valid JSON configuration schema for /xr/info', async ({ request }) => {
    const response = await request.get(`${E2E_BEACH_URL}/xr/info`);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.message).toContain('Tropical XR Paradise');
    expect(data).toHaveProperty('features');
    expect(Array.isArray(data.features)).toBe(true);
    expect(data).toHaveProperty('environment');
    expect(data.environment.theme).toBe('Tropical Paradise');
    expect(data).toHaveProperty('requirements');
    expect(data).toHaveProperty('endpoints');
  });

  // Test 2.2: Page Access and Render Canvas Visibility
  test('should load the XR page and make the render canvas visible', async ({ page }) => {
    await page.goto(`${E2E_BEACH_URL}/xr`);
    await expect(page).toHaveTitle(/Babylon.js XR Environment/i);

    const canvas = page.locator('#renderCanvas');
    await expect(canvas).toBeVisible();
  });

  // Test 2.3: Audio and Volume Controls Presence and Initial State
  test('should display audio track and controls correctly', async ({ page }) => {
    await page.goto(`${E2E_BEACH_URL}/xr`);

    // Verify track information
    const trackInfo = page.locator('.audio-info');
    await expect(trackInfo).toContainText('Ocean Breeze - Jason Sprouse');

    // Verify buttons and controls
    const playBtn = page.locator('#playPause');
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toHaveText(/Play/);

    const muteBtn = page.locator('#muteToggle');
    await expect(muteBtn).toBeVisible();
    await expect(muteBtn).toHaveText(/Mute/);

    const volumeSlider = page.locator('#volumeSlider');
    await expect(volumeSlider).toBeVisible();
    const val = await volumeSlider.getAttribute('value');
    expect(val).toBe('30'); // Default volume in HTML
  });

  // Test 2.4: Interactive navigation and workspace link validation
  test('should render helper navigation links for Lit Compute and NPE Agent Manager', async ({ page }) => {
    await page.goto(`${E2E_BEACH_URL}/xr`);

    const litComputeLink = page.getByRole('link', { name: /Lit Compute Network/i });
    await expect(litComputeLink).toBeVisible();
    await expect(litComputeLink).toHaveAttribute('href', '/lit-compute.html');

    const agentManagerLink = page.getByRole('link', { name: /NPE Agent Manager/i });
    await expect(agentManagerLink).toBeVisible();
    await expect(agentManagerLink).toHaveAttribute('href', '/agent-dashboard.html');
  });

  // Test 2.5: Scene Initialization and Zero Console/Page Errors
  test('should load the tropical paradise scene without console or page errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Register listeners
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    // Go to the beach environment
    await page.goto(`${E2E_BEACH_URL}/xr`);

    // Wait for the status indicator to show
    const status = page.locator('#status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Paradise Ready');

    // Verify there are no console errors recorded
    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Feature 6: Routing, Geo, and Async Compute Actions', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    // Obtain JWT token for authorization
    token = await getAuthToken(request, E2E_API_URL);
  });

  test.describe('Agent Routing Strategies', () => {
    // Register agents and verify matchmaking algorithms
    
    test('should route agent using least-load strategy', async ({ request }) => {
      // 1. Register two agents: Agent A (load = 2), Agent B (load = 0)
      const walletA = ethers.Wallet.createRandom().address;
      const walletB = ethers.Wallet.createRandom().address;

      const agentARes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletA,
          purpose: 'least-load-test-a',
          capabilities: ['compute_ll'],
          maxLoad: 10,
          currentLoad: 2
        }
      });
      expect(agentARes.status()).toBe(201);
      const agentA = await agentARes.json();

      const agentBRes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletB,
          purpose: 'least-load-test-b',
          capabilities: ['compute_ll'],
          maxLoad: 10,
          currentLoad: 0
        }
      });
      expect(agentBRes.status()).toBe(201);
      const agentB = await agentBRes.json();

      // 2. Perform routing call with least-load strategy
      const routeRes = await request.post(`${E2E_API_URL}/agents/route`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          request: { service: 'compute_ll' },
          strategy: { strategy: 'least-load' }
        }
      });
      expect(routeRes.status()).toBe(201);
      const routedAgent = await routeRes.json();

      // 3. Assert Agent B is chosen since currentLoad (0) < Agent A currentLoad (2)
      expect(routedAgent.id).toBe(agentB.id);
    });

    test('should route agent using highest-rating strategy', async ({ request }) => {
      // 1. Register two agents: Agent A (rating = 80), Agent B (rating = 95)
      const walletA = ethers.Wallet.createRandom().address;
      const walletB = ethers.Wallet.createRandom().address;

      const agentARes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletA,
          purpose: 'highest-rating-test-a',
          capabilities: ['compute_hr'],
          performanceScore: 80
        }
      });
      const agentA = await agentARes.json();

      const agentBRes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletB,
          purpose: 'highest-rating-test-b',
          capabilities: ['compute_hr'],
          performanceScore: 95
        }
      });
      const agentB = await agentBRes.json();

      // 2. Perform routing call with highest-rating strategy
      const routeRes = await request.post(`${E2E_API_URL}/agents/route`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          request: { service: 'compute_hr' },
          strategy: { strategy: 'highest-rating' }
        }
      });
      expect(routeRes.status()).toBe(201);
      const routedAgent = await routeRes.json();

      // 3. Assert Agent B is chosen since performanceScore (95) > Agent A performanceScore (80)
      expect(routedAgent.id).toBe(agentB.id);
    });

    test('should route agent using nearest-location strategy', async ({ request }) => {
      // 1. Register two agents: Agent A (NYC), Agent B (London)
      const walletA = ethers.Wallet.createRandom().address;
      const walletB = ethers.Wallet.createRandom().address;

      const agentARes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletA,
          purpose: 'nearest-loc-test-a',
          capabilities: ['compute_nl'],
          location: { lat: 40.7128, lng: -74.0060 } // NYC
        }
      });
      const agentA = await agentARes.json();

      const agentBRes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletB,
          purpose: 'nearest-loc-test-b',
          capabilities: ['compute_nl'],
          location: { lat: 51.5227, lng: -0.0731 } // London
        }
      });
      const agentB = await agentBRes.json();

      // 2. Perform routing call with nearest-location strategy near NYC (40.7580, -73.9855)
      const routeRes = await request.post(`${E2E_API_URL}/agents/route`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          request: { service: 'compute_nl' },
          strategy: {
            strategy: 'nearest-location',
            location: { lat: 40.7580, lng: -73.9855 } // Times Square, NYC
          }
        }
      });
      expect(routeRes.status()).toBe(201);
      const routedAgent = await routeRes.json();

      // 3. Assert Agent A is chosen (NYC is much closer to NYC query than London)
      expect(routedAgent.id).toBe(agentA.id);
    });

    test('should route agent using round-robin strategy', async ({ request }) => {
      // 1. Register two agents: Agent A, Agent B
      const walletA = ethers.Wallet.createRandom().address;
      const walletB = ethers.Wallet.createRandom().address;

      const agentARes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletA,
          purpose: 'rr-test-a',
          capabilities: ['compute_rr']
        }
      });
      const agentA = await agentARes.json();

      const agentBRes = await request.post(`${E2E_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          walletAddress: walletB,
          purpose: 'rr-test-b',
          capabilities: ['compute_rr']
        }
      });
      const agentB = await agentBRes.json();

      // 2. Perform multiple routing calls with round-robin strategy
      const call1Res = await request.post(`${E2E_API_URL}/agents/route`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          request: { service: 'compute_rr' },
          strategy: { strategy: 'round-robin' }
        }
      });
      const routedAgent1 = await call1Res.json();

      const call2Res = await request.post(`${E2E_API_URL}/agents/route`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          request: { service: 'compute_rr' },
          strategy: { strategy: 'round-robin' }
        }
      });
      const routedAgent2 = await call2Res.json();

      const call3Res = await request.post(`${E2E_API_URL}/agents/route`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          request: { service: 'compute_rr' },
          strategy: { strategy: 'round-robin' }
        }
      });
      const routedAgent3 = await call3Res.json();

      // 3. Assert cycle order
      expect(routedAgent1.id).not.toBe(routedAgent2.id);
      expect(routedAgent3.id).toBe(routedAgent1.id);
    });
  });

  test.describe('Geo Query Containment', () => {
    test('should verify containment of coordinates inside geo zones', async ({ request }) => {
      // 1. Fetch active zones
      const zonesRes = await request.get(`${E2E_API_URL}/geo/zones`);
      expect(zonesRes.status()).toBe(200);
      const zones = await zonesRes.json();
      expect(zones.length).toBeGreaterThan(0);

      // Find the NYC Seeded Zone: "Downtown Manhattan"
      const nycZone = zones.find((z: any) => z.name === 'Downtown Manhattan');
      expect(nycZone).toBeDefined();

      // 2. Verify NYC coordinate is nearby/within the zone
      const nearbyRes = await request.get(`${E2E_API_URL}/geo/zones/nearby`, {
        params: { lat: 40.7580, lng: -73.9855, radiusKm: 5 } // Times Square, NYC
      });
      expect(nearbyRes.status()).toBe(200);
      const nearbyZones = await nearbyRes.json();
      expect(nearbyZones.some((z: any) => z.id === nycZone.id)).toBe(true);

      // 3. Assert contains endpoint with inside point (Times Square, NYC)
      const insideRes = await request.get(`${E2E_API_URL}/geo/zones/${nycZone.id}/contains`, {
        params: { lat: 40.7580, lng: -73.9855 }
      });
      expect(insideRes.status()).toBe(200);
      const insideBody = await insideRes.json();
      expect(insideBody.inside).toBe(true);

      // 4. Assert contains endpoint with outside point (Paris coordinates)
      const outsideRes = await request.get(`${E2E_API_URL}/geo/zones/${nycZone.id}/contains`, {
        params: { lat: 48.8566, lng: 2.3522 }
      });
      expect(outsideRes.status()).toBe(200);
      const outsideBody = await outsideRes.json();
      expect(outsideBody.inside).toBe(false);
    });
  });

  test.describe('Async Compute Job & WebSocket Stream', () => {
    test('should process compute job and stream status transitions over WebSockets', async ({ request }) => {
      // 1. Establish WebSocket client connection to y8-server
      const wsUrl = E2E_API_URL.replace('/api/v1', '');
      const socket: Socket = io(wsUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      const receivedEvents: Array<{ status: string; jobId: string }> = [];

      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => resolve());
        socket.on('connect_error', (err: any) => reject(err));
      });

      // 2. Set up event listeners for transitions
      socket.on('job.queued', (data: any) => receivedEvents.push({ status: 'queued', jobId: data.id }));
      socket.on('job.running', (data: any) => receivedEvents.push({ status: 'running', jobId: data.id }));
      socket.on('job.completed', (data: any) => receivedEvents.push({ status: 'completed', jobId: data.id }));

      // 3. Submit async compute job (type: 'delay', ms: 200) via HTTP POST
      const jobRes = await request.post(`${E2E_API_URL}/compute/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          type: 'delay',
          payload: { ms: 200, result: 'compute-success' }
        }
      });
      expect(jobRes.status()).toBe(201);
      const job = await jobRes.json();
      expect(job.id).toBeDefined();

      // 4. Wait for job to complete by listening to WS events
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('WebSocket completion timeout')), 5000);
        socket.on('job.completed', (data: any) => {
          if (data.id === job.id) {
            clearTimeout(timeout);
            socket.disconnect();
            resolve();
          }
        });
        socket.on('job.failed', (data: any) => {
          if (data.id === job.id) {
            clearTimeout(timeout);
            socket.disconnect();
            reject(new Error(`Job failed: ${data.error}`));
          }
        });
      });

      // 5. Assert WS transitions sequence matches ['queued', 'running', 'completed'] for this job ID
      const jobEvents = receivedEvents.filter(e => e.jobId === job.id);
      expect(jobEvents.map(e => e.status)).toEqual(['queued', 'running', 'completed']);
    });
  });
});
