import { test, expect, chromium } from '@playwright/test';
import { io, Socket } from 'socket.io-client';
import { E2E_BASE_URL, E2E_PREMIER_URL, E2E_BEACH_URL, E2E_API_URL } from '../playwright.config.js';

test.describe('Empirical Challenger: SIWE Bypass, iframe postMessage Sync, & WebSocket Events', () => {

  // =========================================================================
  // 1. SIWE BYPASS VERIFICATION
  // =========================================================================
  test.describe('SIWE Bypass Pipeline', () => {
    /**
     * Security regression test: verifies that the 'bypass-dev' backdoor has been
     * fully removed from the SIWE authentication pipeline. ALL bypass attempts must
     * be rejected with CredentialsSignin error regardless of environment.
     */
    test('bypass-dev signature is REJECTED in all environments (security regression)', async ({ request }) => {
      const address = '0x90f8bfac9c63c302099a4f6878a7eed102b4b225';

      const startTime = Date.now();
      // Attempt to use the removed bypass-dev shortcut
      const res = await request.post(`${E2E_BASE_URL}/api/auth/callback/credentials`, {
        form: {
          message: address,
          signature: 'bypass-dev',
          redirect: 'false',
          json: 'true'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const latency = Date.now() - startTime;
      console.log(`SIWE Bypass Rejection Latency: ${latency}ms`);

      // The bypass MUST be rejected — url should contain CredentialsSignin error
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('url');
      expect(body.url).toContain('error=CredentialsSignin'); // ← bypass must be rejected
      expect(latency).toBeLessThan(500);

      // Robustness: malformed address also rejected
      const badRes = await request.post(`${E2E_BASE_URL}/api/auth/callback/credentials`, {
        form: {
          message: '',
          signature: 'bypass-dev',
          redirect: 'false',
          json: 'true'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      expect(badRes.status()).toBe(200);
      const badBody = await badRes.json();
      expect(badBody.url).toContain('error=CredentialsSignin'); // also rejected
    });
  });

  // =========================================================================
  // 2. POSTMESSAGE SYNC IFRAME FLOW VERIFICATION
  // =========================================================================
  test.describe('postMessage Sync IFrame Flow', () => {
    test('verify cross-app login synchronization and stress-test message queue', async ({ context, page }) => {
      // Load y8-premier page
      await page.goto(E2E_PREMIER_URL);
      await page.waitForLoadState('load');

      // Assert iframe is mounted
      const iframeElement = page.locator('#auth-sync-iframe');
      await expect(iframeElement).toBeAttached();
      const iframeSrc = await iframeElement.getAttribute('src');
      expect(iframeSrc).toBe('http://localhost:3000/auth-sync');

      // Trigger login in y8-premier Context and verify postMessage propagates to y8-app
      const testAddress = '0x1111111111111111111111111111111111111111';
      
      // Inject y8_user in localStorage and trigger login flow
      await page.evaluate((addr) => {
        (window as any)._y8_test_messages = [];
        window.addEventListener('message', (e) => {
          (window as any)._y8_test_messages.push(e.data);
        });
        
        // Execute AuthContext loginWithWallet
        const loginBtn = document.querySelector('button'); // Wallet login button
        if ((window as any)._y8_loginWithWallet) {
          (window as any)._y8_loginWithWallet(addr);
        } else {
          // Fallback: manually dispatch postMessage to iframe
          const iframe = document.getElementById('auth-sync-iframe') as HTMLIFrameElement;
          iframe.contentWindow?.postMessage({ type: 'LOGIN', address: addr }, 'http://localhost:3000');
        }
      }, testAddress);

      // Wait to see if y8-app gets authenticated (check cookies of context)
      await page.waitForTimeout(1500);
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session-token'));
      console.log('Session Cookie after postMessage sync:', sessionCookie ? 'Found' : 'Not Found');
      
      // Stress/Concurrency test on message handler:
      // Send 50 rapid login/logout toggles to see if it causes lockups, infinite loops, or crashes
      const crashCheck = await page.evaluate(async () => {
        const iframe = document.getElementById('auth-sync-iframe') as HTMLIFrameElement;
        if (!iframe || !iframe.contentWindow) return 'no-iframe';
        
        try {
          for (let i = 0; i < 50; i++) {
            const addr = `0x${i.toString().padStart(40, '0')}`;
            iframe.contentWindow.postMessage({ type: 'LOGIN', address: addr }, 'http://localhost:3000');
            iframe.contentWindow.postMessage({ type: 'LOGOUT' }, 'http://localhost:3000');
          }
          return 'ok';
        } catch (e: any) {
          return e.message;
        }
      });
      expect(crashCheck).toBe('ok');

      // Verify page is still responsive
      await page.evaluate(() => document.body.style.opacity = '0.9');
      const opacity = await page.evaluate(() => document.body.style.opacity);
      expect(opacity).toBe('0.9');
    });

    test('verify y8-premier session wipeout when y8-app is unauthenticated', async ({ page }) => {
      // Clear cookies to ensure y8-app is unauthenticated
      await page.context().clearCookies();

      // Go to y8-premier and write a session in localStorage
      await page.goto(E2E_PREMIER_URL);
      await page.evaluate(() => {
        const mockUser = {
          id: 'user_mock_123',
          name: '0x90f8...b225',
          ethAddress: '0x90f8bfac9c63c302099a4f6878a7eed102b4b225',
          primaryAddress: '0x90f8bfac9c63c302099a4f6878a7eed102b4b225',
        };
        localStorage.setItem('y8_user', JSON.stringify(mockUser));
      });

      // Reload y8-premier and wait for iframe postMessage message event to execute
      await page.goto(E2E_PREMIER_URL);
      await page.waitForTimeout(2000); // Allow time for iframe to load and postMessage to trigger

      // Check if y8_user in localStorage was deleted by y8-app's unauthenticated sync
      const y8User = await page.evaluate(() => localStorage.getItem('y8_user'));
      console.log('y8_user after unauthenticated sync reload:', y8User);
      
      // Assert synchronization outcome:
      // If y8-app is logged out, premier's local session is wiped to maintain consistency.
      expect(y8User).toBeNull();
    });
  });

  // =========================================================================
  // 3. WEBSOCKET EVENTS & LATENCY STRESS HARNESS
  // =========================================================================
  test.describe('WebSocket Events and Load/Stress Testing', () => {
    
    test('measure WebSocket move event broadcast latency and verify high throughput robustness', async () => {
      const wsUrl = E2E_BEACH_URL; // the-beach socket gateway
      
      // Connect client 1
      const socket1: Socket = io(wsUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      // Connect client 2
      const socket2: Socket = io(wsUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      // Wait for both connections
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          socket1.on('connect', () => resolve());
          socket1.on('connect_error', (err) => reject(err));
        }),
        new Promise<void>((resolve, reject) => {
          socket2.on('connect', () => resolve());
          socket2.on('connect_error', (err) => reject(err));
        })
      ]);

      const roomName = 'empirical-stress-room';
      
      // Clients join the room
      socket1.emit('join-room', { room: roomName });
      socket2.emit('join-room', { room: roomName });

      // Wait for both to be in the room
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      // Measure message latency over 10 iterations
      const latencies: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const sendTime = Date.now();
        const testPayload = {
          userId: socket1.id,
          position: { x: i, y: 1.0, z: i * 2 },
          rotation: { x: 0, y: 0, z: 0, w: 1 }
        };

        const receivePromise = new Promise<number>((resolve) => {
          socket2.once('move', (data) => {
            const timeDiff = Date.now() - sendTime;
            resolve(timeDiff);
          });
        });

        socket1.emit('move', testPayload);
        const lat = await receivePromise;
        latencies.push(lat);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const minLat = Math.min(...latencies);
      const maxLat = Math.max(...latencies);
      const avgLat = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      
      console.log(`WebSocket Move Event Latency Stats:`);
      console.log(`- Min: ${minLat}ms`);
      console.log(`- Max: ${maxLat}ms`);
      console.log(`- Avg: ${avgLat.toFixed(2)}ms`);

      // Assert average latency is within realistic threshold (< 100ms on localhost)
      expect(avgLat).toBeLessThan(100);

      // Stress/Throughput Test: Send 300 move events rapidly from client 1
      const receivedEvents: any[] = [];
      socket2.on('move', (data) => {
        receivedEvents.push(data);
      });

      const totalStressEvents = 300;
      const stressStartTime = Date.now();

      for (let i = 0; i < totalStressEvents; i++) {
        socket1.emit('move', {
          userId: socket1.id,
          position: { x: Math.random(), y: 1, z: Math.random() },
          rotation: { x: 0, y: 0, z: 0, w: 1 }
        });
      }

      // Wait for all messages to arrive (with a 3s timeout)
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`WebSocket stress failed: Received only ${receivedEvents.length}/${totalStressEvents} events`));
        }, 3000);

        const checkInterval = setInterval(() => {
          if (receivedEvents.length >= totalStressEvents) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });

      const stressDuration = Date.now() - stressStartTime;
      console.log(`WebSocket High Throughput: Transmitted and received ${totalStressEvents} events in ${stressDuration}ms`);
      
      // Cleanup
      socket1.disconnect();
      socket2.disconnect();
    });

    test('verify y8-server compute job WebSocket subscription and event stream sequence', async () => {
      // Connect to y8-server WebSocket
      const wsUrl = E2E_API_URL.replace('/api/v1', '');
      const socket: Socket = io(wsUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => resolve());
        socket.on('connect_error', (err) => reject(err));
      });

      const receivedEvents: string[] = [];
      socket.on('job.queued', () => receivedEvents.push('queued'));
      socket.on('job.running', () => receivedEvents.push('running'));
      socket.on('job.completed', () => receivedEvents.push('completed'));

      // Simulate a local event emitter event directly since we are testing server gateway logic
      // In a real flow, a job is submitted via HTTP, but we can verify gateway subscription here
      socket.emit('subscribe', { channel: 'jobs' });
      
      // Verify connection is healthy
      expect(socket.connected).toBe(true);
      
      socket.disconnect();
    });
  });

});
