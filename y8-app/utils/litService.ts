// utils/litService.ts
// Handles DAG-JOSE / JWE encryption and decryption
// Implements strict in-memory decrypted states (no plaintext cache) and local contract verification.

export interface JWELog {
  protected: string;
  iv: string;
  ciphertext: string;
  tag: string;
  patientDID: string;
  patientAddress: string;
  sanctuaryId: string;
  accessControlConditions: any[];
}

// Helper to convert ArrayBuffer or Uint8Array to Hex String
const bufToHex = (buffer: ArrayBuffer | Uint8Array): string => {
  return Array.from(new Uint8Array(buffer as any))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Helper to convert Hex String to Uint8Array
const hexToBuf = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

/**
 * Encrypts diagnostic checkup payload client-side in-memory.
 * Returns a JWE envelope containing the ciphertext and Lit Access Control Conditions (ACCs).
 */
export const encryptDiagnostics = async (
  plaintext: string,
  patientDID: string,
  patientAddress: string,
  sanctuaryId: string,
  accessRegistryAddress: string
): Promise<JWELog> => {
  if (typeof window === 'undefined') {
    throw new Error('Encryption is client-side only');
  }

  // 1. Generate a random AES-GCM symmetric key
  const crypto = window.crypto;
  const rawKey = crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
  const aesKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // 2. Encrypt the plaintext string
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoder = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoder.encode(plaintext)
  );

  // Split ciphertext and GCM authentication tag (AES-GCM in browser appends tag to ciphertext)
  const totalLength = encryptedBuffer.byteLength;
  const ciphertextBuffer = encryptedBuffer.slice(0, totalLength - 16);
  const tagBuffer = encryptedBuffer.slice(totalLength - 16);

  // 3. Define Lit Access Control Conditions (ACCs)
  // Decryption allowed if: patient address == reader, OR reader is whitelisted doctor, OR override is active.
  const accessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '==',
        value: patientAddress
      }
    },
    { operator: 'or' },
    {
      contractAddress: accessRegistryAddress,
      functionName: 'isDoctorDID',
      functionParams: [':userAddress'],
      returnValueTest: {
        key: '',
        comparator: '==',
        value: 'true'
      },
      chain: 'ethereum',
      standardContractType: ''
    },
    { operator: 'or' },
    {
      contractAddress: accessRegistryAddress,
      functionName: 'emergencyOverrideActive',
      functionParams: [],
      returnValueTest: {
        key: '',
        comparator: '==',
        value: 'true'
      },
      chain: 'ethereum',
      standardContractType: ''
    }
  ];

  // 4. Simulate encrypting the symmetric key using Lit (or local simulated envelope)
  // For local Hardhat node simulation, we embed the symmetric key encrypted with a local salt.
  // In real Lit public deployment, this raw key is sent to Lit nodes to be encrypted under the ACCs.
  const salt = encoder.encode('Y8_LOCAL_SANCTUARY_KEY_SALT');
  const hashedKeyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    hashedKeyBytes[i] = rawKey[i] ^ (salt[i % salt.length] || 0);
  }
  const protectedHeader = btoa(JSON.stringify({ alg: 'A256GCM', enc: 'LitV6Recap' }));

  return {
    protected: protectedHeader,
    iv: bufToHex(iv),
    ciphertext: bufToHex(ciphertextBuffer),
    tag: bufToHex(tagBuffer),
    patientDID,
    patientAddress,
    sanctuaryId,
    accessControlConditions,
    // Store simulated encrypted key (locally reversible for Hardhat test node validation)
    _localKey: bufToHex(hashedKeyBytes)
  } as any;
};

/**
 * Decrypts JWE diagnostic records.
 * Decryption is executed STRICTLY in-memory (RAM) and returned as a string.
 * The calling component MUST NOT save the plaintext to disk or cache.
 */
export const decryptDiagnostics = async (
  jwe: any,
  readerAddress: string,
  hasAccessContractResult: boolean // Evaluated on-chain from Y8AccessRegistry.sol
): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('Decryption is client-side only');
  }

  // Enforce Access Gating rules
  if (!hasAccessContractResult) {
    throw new Error('ACCESS DENIED: Wallet address does not satisfy Access Control Conditions.');
  }

  // 1. Recover the symmetric key
  // Reverses the local simulation salt mapping
  const hashedKey = hexToBuf(jwe._localKey);
  const encoder = new TextEncoder();
  const salt = encoder.encode('Y8_LOCAL_SANCTUARY_KEY_SALT');
  const rawKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    rawKey[i] = hashedKey[i] ^ (salt[i % salt.length] || 0);
  }

  // 2. Import key for browser decryption
  const crypto = window.crypto;
  const aesKey = await crypto.subtle.importKey(
    'raw',
    rawKey as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // 3. Assemble full cipher + tag buffer for decrypt call
  const iv = hexToBuf(jwe.iv);
  const ciphertext = hexToBuf(jwe.ciphertext);
  const tag = hexToBuf(jwe.tag);

  const fullBuffer = new Uint8Array(ciphertext.length + tag.length);
  fullBuffer.set(ciphertext);
  fullBuffer.set(tag, ciphertext.length);

  // 4. Decrypt in-memory
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    aesKey,
    fullBuffer as BufferSource
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
