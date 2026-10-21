import { test, expect } from '@playwright/test';
import { io, Socket } from 'socket.io-client';
import { E2E_BEACH_URL, E2E_API_URL } from '../playwright.config.js';

test.describe('Gateway Security & Rate Limiting Verification', () => {
  const beachWsUrl = E2E_BEACH_URL; // the-beach socket gateway
  const serverWsUrl = E2E_API_URL.replace('/api/v1', ''); // y8-server socket gateway

  test('Origin Verification: should reject connection from unauthorized origin localhost.attacker.com', async () => {
    // 1. Try to connect to y8-server socket gateway with malicious origin
    const socketServer = io(serverWsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      extraHeaders: {
        Origin: 'http://localhost.attacker.com'
      }
    });

    const serverConnectPromise = new Promise<string>((resolve) => {
      socketServer.on('connect', () => {
        resolve('CONNECTED');
      });
      socketServer.on('connect_error', (err) => {
        resolve(`REJECTED: ${err.message}`);
      });
    });

    // 2. Try to connect to the-beach socket gateway with malicious origin
    const socketBeach = io(beachWsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      extraHeaders: {
        Origin: 'http://localhost.attacker.com'
      }
    });

    const beachConnectPromise = new Promise<string>((resolve) => {
      socketBeach.on('connect', () => {
        resolve('CONNECTED');
      });
      socketBeach.on('connect_error', (err) => {
        resolve(`REJECTED: ${err.message}`);
      });
    });

    const [serverResult, beachResult] = await Promise.all([
      serverConnectPromise,
      beachConnectPromise
    ]);

    console.log(`Server origin validation check: ${serverResult}`);
    console.log(`Beach origin validation check: ${beachResult}`);

    // Cleanup
    socketServer.disconnect();
    socketBeach.disconnect();

    // Assert rejection of subdomains like localhost.attacker.com
    expect(serverResult).toContain('REJECTED');
    expect(beachResult).toContain('REJECTED');
  });

  test('Rate Limiting Verification: should throttle high-frequency move events', async () => {
    // Connect client 1 (sender)
    const socket1 = io(beachWsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Connect client 2 (receiver)
    const socket2 = io(beachWsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

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

    const roomName = 'rate-limit-test-room';
    socket1.emit('join-room', { room: roomName });
    socket2.emit('join-room', { room: roomName });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const receivedEvents: any[] = [];
    socket2.on('move', (data) => {
      receivedEvents.push(data);
    });

    // Send 10 move events rapidly
    const numEvents = 10;
    for (let i = 0; i < numEvents; i++) {
      socket1.emit('move', {
        userId: socket1.id,
        position: { x: i, y: 1, z: i },
        rotation: { x: 0, y: 0, z: 0, w: 1 }
      });
    }

    // Wait 1 second to gather all events that might have been processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`Rate Limiting check: Sent ${numEvents} events, received ${receivedEvents.length} events`);

    // Cleanup
    socket1.disconnect();
    socket2.disconnect();

    // Since the rate limit is 30ms window per event, out of 10 rapid events,
    // only the first should pass, and the rest (9) should be blocked.
    // So we expect receivedEvents.length to be exactly 1 or 2 (depending on timing) but definitely less than numEvents.
    expect(receivedEvents.length).toBeLessThan(numEvents);
  });
});
