import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { Address } from 'viem';

// ── ABI ──────────────────────────────────────────────────────────────────────

export const Y8_SETTINGS_ABI = [
  {
    inputs: [
      { name: 'gpsEnabled',    type: 'bool' },
      { name: 'activeDriver',  type: 'bool' },
      { name: 'onlineStatus',  type: 'bool' },
      { name: 'notifications', type: 'bool' },
      { name: 'privacyMode',   type: 'bool' },
      { name: 'darkMode',      type: 'bool' },
    ],
    name: 'updateSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getSettings',
    outputs: [
      {
        components: [
          { name: 'gpsEnabled',    type: 'bool' },
          { name: 'activeDriver',  type: 'bool' },
          { name: 'onlineStatus',  type: 'bool' },
          { name: 'notifications', type: 'bool' },
          { name: 'privacyMode',   type: 'bool' },
          { name: 'darkMode',      type: 'bool' },
          { name: 'lastUpdated',   type: 'uint256' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      {
        components: [
          { name: 'gpsEnabled',    type: 'bool' },
          { name: 'activeDriver',  type: 'bool' },
          { name: 'onlineStatus',  type: 'bool' },
          { name: 'notifications', type: 'bool' },
          { name: 'privacyMode',   type: 'bool' },
          { name: 'darkMode',      type: 'bool' },
          { name: 'lastUpdated',   type: 'uint256' },
        ],
        indexed: false,
        name: 'settings',
        type: 'tuple',
      },
    ],
    name: 'SettingsUpdated',
    type: 'event',
  },
] as const;

export const Y8_ENTROPY_ABI = [
  {
    inputs: [
      { name: 'entropyHash', type: 'bytes32' },
      { name: 'deviceType',  type: 'string' },
      { name: 'score',       type: 'uint256' },
      { name: 'gps',         type: 'bool' },
      { name: 'motion',      type: 'bool' },
      { name: 'network',     type: 'bool' },
    ],
    name: 'mintProof',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserProofs',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'proofs',
    outputs: [
      { name: 'entropyHash', type: 'bytes32' },
      { name: 'timestamp',   type: 'uint256' },
      { name: 'minter',      type: 'address' },
      { name: 'deviceType',  type: 'string' },
      { name: 'score',       type: 'uint256' },
      { name: 'gps',         type: 'bool' },
      { name: 'motion',      type: 'bool' },
      { name: 'network',     type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: 'tokenId',     type: 'uint256' },
      { indexed: true,  name: 'minter',      type: 'address' },
      { indexed: false, name: 'entropyHash', type: 'bytes32' },
      { indexed: false, name: 'score',       type: 'uint256' },
    ],
    name: 'ProofMinted',
    type: 'event',
  },
] as const;

// ── Default undeployed sentinel ───────────────────────────────────────────────
export const UNDEPLOYED = '0x0000000000000000000000000000000000000000' as Address;

// ── Hook: read settings from contract ────────────────────────────────────────
export function useY8Settings(userAddress: Address | undefined, contractAddress: Address) {
  return useReadContract({
    address: contractAddress === UNDEPLOYED ? undefined : contractAddress,
    abi: Y8_SETTINGS_ABI,
    functionName: 'getSettings',
    args: userAddress ? [userAddress] : undefined,
    chainId: baseSepolia.id,
    query: { enabled: !!userAddress && contractAddress !== UNDEPLOYED },
  });
}

// ── Hook: write settings to contract ─────────────────────────────────────────
export function useUpdateSettings(contractAddress: Address) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const update = async (settings: {
    gpsEnabled: boolean;
    activeDriver: boolean;
    onlineStatus: boolean;
    notifications: boolean;
    privacyMode: boolean;
    darkMode: boolean;
  }) => {
    return writeContractAsync({
      address: contractAddress,
      abi: Y8_SETTINGS_ABI,
      functionName: 'updateSettings',
      args: [
        settings.gpsEnabled,
        settings.activeDriver,
        settings.onlineStatus,
        settings.notifications,
        settings.privacyMode,
        settings.darkMode,
      ],
      chainId: baseSepolia.id,
    });
  };

  return { update, isPending: isPending || isConfirming, isSuccess, hash };
}
