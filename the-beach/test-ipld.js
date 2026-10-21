// Simple IPLD test script
const { encode } = require('multiformats/block');
const { sha256 } = require('multiformats/hashes/sha2');
const dagCBOR = require('@ipld/dag-cbor');

async function test() {
  console.log('Testing IPLD...');
  
  const nodeData = {
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    publicKey: '0x04a1b2c3d4e5...',
    capabilities: {
      maxConcurrentJobs: 4,
      supportedOperations: ['encrypt', 'decrypt', 'sign']
    },
    timestamp: Date.now()
  };
  
  try {
    const block = await encode({
      value: nodeData,
      codec: dagCBOR,
      hasher: sha256,
    });
    
    console.log('✅ CID created successfully:', block.cid.toString());
    console.log('✅ Multiaddr:', `/ip4/127.0.0.1/tcp/3000/ipld/${block.cid.toString()}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
