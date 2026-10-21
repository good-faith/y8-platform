import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { E2E_API_URL } from '../../playwright.config';

test.describe('Feature 1: y8-server API Health Check (/api/v1/health)', () => {
  // Test 1: Verify HTTP 200 OK Status
  test('should return 200 OK status code', async ({ request }) => {
    const response = await request.get(`${E2E_API_URL}/health`);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  // Test 2: Verify Response Content Type Header
  test('should return application/json content-type header', async ({ request }) => {
    const response = await request.get(`${E2E_API_URL}/health`);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  // Test 3: Verify Schema Structure
  test('should contain status and timestamp keys in the JSON body', async ({ request }) => {
    const response = await request.get(`${E2E_API_URL}/health`);
    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    const keys = Object.keys(body);
    expect(keys.length).toBe(2);
  });

  // Test 4: Verify Status Field Value
  test('should return status as "ok"', async ({ request }) => {
    const response = await request.get(`${E2E_API_URL}/health`);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  // Test 5: Verify Timestamp Validity and Range
  test('should return a valid recent timestamp', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${E2E_API_URL}/health`);
    const body = await response.json();
    const endTime = Date.now();

    expect(typeof body.timestamp).toBe('number');
    // Ensure the timestamp is reasonably close to current time (within 10-second window)
    expect(body.timestamp).toBeGreaterThanOrEqual(startTime - 5000);
    expect(body.timestamp).toBeLessThanOrEqual(endTime + 5000);
  });
});

test.describe('Feature 4: SIWE Cryptographic Pipeline', () => {
  const wallet = ethers.Wallet.createRandom();

  // Test 4.1: Nonce Generation Happy Path
  test('should retrieve a challenge nonce from the backend', async ({ request }) => {
    const response = await request.get(`${E2E_API_URL}/auth/nonce`);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('nonce');
    expect(data).toHaveProperty('expiresAt');
    expect(typeof data.nonce).toBe('string');
    expect(typeof data.expiresAt).toBe('number');
  });

  // Test 4.2: SIWE Base Sepolia Happy Path Authentication and Profile retrieval
  test('should verify SIWE on Base Sepolia and retrieve current user profile', async ({ request }) => {
    const nonceRes = await request.get(`${E2E_API_URL}/auth/nonce`);
    const { nonce } = await nonceRes.json();

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

    const signature = await wallet.signMessage(message);

    const verifyRes = await request.post(`${E2E_API_URL}/auth/siwe/verify`, {
      data: { message, signature }
    });
    expect(verifyRes.status()).toBe(200);

    const authData = await verifyRes.json();
    expect(authData).toHaveProperty('accessToken');
    expect(authData).toHaveProperty('user');
    expect(authData.user.walletAddress.toLowerCase()).toBe(address.toLowerCase());

    // Verify /auth/me profile works with the returned token
    const meRes = await request.get(`${E2E_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authData.accessToken}` }
    });
    expect(meRes.status()).toBe(200);
    const meData = await meRes.json();
    expect(meData.walletAddress.toLowerCase()).toBe(address.toLowerCase());
  });

  // Test 4.3: SIWE Base Mainnet Happy Path Authentication
  test('should verify SIWE on Base Mainnet successfully', async ({ request }) => {
    const nonceRes = await request.get(`${E2E_API_URL}/auth/nonce`);
    const { nonce } = await nonceRes.json();

    const domain = 'localhost';
    const origin = 'http://localhost:3000';
    const address = await wallet.getAddress();
    const statement = 'Sign in with Ethereum to Y8 Platform.';
    const chainId = 8453; // Base Mainnet

    const message = `${domain} wants you to sign in with your Ethereum account:\n` +
      `${address}\n\n` +
      `${statement}\n\n` +
      `URI: ${origin}\n` +
      `Version: 1\n` +
      `Chain ID: ${chainId}\n` +
      `Nonce: ${nonce}\n` +
      `Issued At: ${new Date().toISOString()}`;

    const signature = await wallet.signMessage(message);

    const verifyRes = await request.post(`${E2E_API_URL}/auth/siwe/verify`, {
      data: { message, signature }
    });
    expect(verifyRes.status()).toBe(200);

    const authData = await verifyRes.json();
    expect(authData).toHaveProperty('accessToken');
    expect(authData.user.walletAddress.toLowerCase()).toBe(address.toLowerCase());
  });

  // Test 4.4: Nonce Replay Prevention (Double verification rejection)
  test('should prevent nonce replay attacks and fail on double verify', async ({ request }) => {
    const nonceRes = await request.get(`${E2E_API_URL}/auth/nonce`);
    const { nonce } = await nonceRes.json();

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

    const signature = await wallet.signMessage(message);

    // 1st verify succeeds
    const verifyRes1 = await request.post(`${E2E_API_URL}/auth/siwe/verify`, {
      data: { message, signature }
    });
    expect(verifyRes1.status()).toBe(200);

    // 2nd verify fails because the nonce is consumed
    const verifyRes2 = await request.post(`${E2E_API_URL}/auth/siwe/verify`, {
      data: { message, signature }
    });
    expect(verifyRes2.status()).toBe(401);
    const errorBody = await verifyRes2.json();
    expect(errorBody.message).toContain('Nonce invalid or already used');
  });

  // Test 4.5: Unsupported Chain Rejection
  test('should reject SIWE signatures from unsupported chain IDs', async ({ request }) => {
    const nonceRes = await request.get(`${E2E_API_URL}/auth/nonce`);
    const { nonce } = await nonceRes.json();

    const domain = 'localhost';
    const origin = 'http://localhost:3000';
    const address = await wallet.getAddress();
    const statement = 'Sign in with Ethereum to Y8 Platform.';
    const chainId = 1; // Ethereum Mainnet (Unsupported)

    const message = `${domain} wants you to sign in with your Ethereum account:\n` +
      `${address}\n\n` +
      `${statement}\n\n` +
      `URI: ${origin}\n` +
      `Version: 1\n` +
      `Chain ID: ${chainId}\n` +
      `Nonce: ${nonce}\n` +
      `Issued At: ${new Date().toISOString()}`;

    const signature = await wallet.signMessage(message);

    const verifyRes = await request.post(`${E2E_API_URL}/auth/siwe/verify`, {
      data: { message, signature }
    });
    expect(verifyRes.status()).toBe(401);
    const errorBody = await verifyRes.json();
    expect(errorBody.message).toContain('not supported');
  });

  // Test 4.6: Invalid/Fake Nonce Rejection
  test('should reject SIWE signatures containing invalid nonces', async ({ request }) => {
    const domain = 'localhost';
    const origin = 'http://localhost:3000';
    const address = await wallet.getAddress();
    const statement = 'Sign in with Ethereum to Y8 Platform.';
    const chainId = 84532;
    const fakeNonce = 'abcdef0123456789';

    const message = `${domain} wants you to sign in with your Ethereum account:\n` +
      `${address}\n\n` +
      `${statement}\n\n` +
      `URI: ${origin}\n` +
      `Version: 1\n` +
      `Chain ID: ${chainId}\n` +
      `Nonce: ${fakeNonce}\n` +
      `Issued At: ${new Date().toISOString()}`;

    const signature = await wallet.signMessage(message);

    const verifyRes = await request.post(`${E2E_API_URL}/auth/siwe/verify`, {
      data: { message, signature }
    });
    expect(verifyRes.status()).toBe(401);
    const errorBody = await verifyRes.json();
    expect(errorBody.message).toContain('Nonce invalid or already used');
  });
});
