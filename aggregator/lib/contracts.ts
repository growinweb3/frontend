import { Address, getAddress } from 'viem'

// Contract addresses for Lisk Sepolia network
export const CONTRACTS = {
  ROUTER: getAddress('0x7dC0da00F845A4272C08E51a57651ac004f5e0C7'),
  MOCK_USDC: getAddress('0x6f576F9A89555b028ce97581DA6d10e35d433F04'),
  MOCK_USDT: getAddress('0xA8BD95EfA4D1d34B5AD2e73CCCDd7C4F956B5e5F'),
  // Vault contracts for different risk levels
  VAULT_CONSERVATIVE: getAddress('0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c'),
  VAULT_BALANCED: getAddress('0x21AF332B10481972B903cBd6C3f1ec51546552e7'),
  VAULT_AGGRESSIVE: getAddress('0xc4E50772bd6d27661EE12d81e62Daa4882F4E6f4'),
  // Strategy contracts (abstracted by vaults, rarely need direct interaction)
  STRATEGY_AAVE: getAddress('0x85A1B6A61C5E73418A40A3a79F6E811Ee848dAa7'),
  STRATEGY_COMPOUND: getAddress('0x4B29149492019fE65D0363097728Cab61Cb97F0f'),
  // Protocol mock contracts
  MOCK_PROTOCOL_AAVE: getAddress('0x53175d08E96a961233ea333385EA74E74C556Cf1'),
  MOCK_PROTOCOL_COMPOUND: getAddress('0x831f464C241eAa6CcF72F5570c7F5E5f9759317e'),
} as const

// Chain configuration for Lisk Sepolia
export const LISK_SEPOLIA = {
  id: 4202,
  name: 'Lisk Sepolia',
  network: 'lisk-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
      webSocket: ['wss://ws.sepolia-api.lisk.com'],
    },
    public: {
      http: ['https://rpc.sepolia-api.lisk.com'],
      webSocket: ['wss://ws.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
} as const

// Router contract ABI - Batch deposit/withdraw system with RiskLevel enum
// RiskLevel: 0 = Conservative, 1 = Balanced, 2 = Aggressive
export const ROUTER_ABI = [
  // Read functions - Batch and queue queries
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'riskLevel', type: 'uint8' },
    ],
    name: 'getPendingDeposit',
    outputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'riskLevel', type: 'uint8' },
    ],
    name: 'getPendingWithdraw',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'getNextBatchTime',
    outputs: [{ name: 'nextBatchTime', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'isBatchReady',
    outputs: [{ name: 'ready', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'uint8' },
    ],
    name: 'claimableShares',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'uint8' },
    ],
    name: 'claimableUSDC',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'batchInterval',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minDepositAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'totalPendingDeposits',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'totalPendingWithdraws',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint8' }],
    name: 'vaults',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'usdc',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  
  // Write functions - Queue deposit/withdraw
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'riskLevel', type: 'uint8' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'riskLevel', type: 'uint8' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  
  // Claim functions - Get shares/USDC after batch execution
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'claimDepositShares',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'claimWithdrawAssets',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  
  // Cancel functions
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'riskLevel', type: 'uint8' },
    ],
    name: 'cancelPendingDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'riskLevel', type: 'uint8' },
    ],
    name: 'cancelPendingWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  
  // Batch execution (typically called by backend/keeper)
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'executeBatchDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'riskLevel', type: 'uint8' }],
    name: 'executeBatchWithdraws',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'riskLevel', type: 'uint8' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'nextBatchTime', type: 'uint256' },
    ],
    name: 'DepositQueued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'riskLevel', type: 'uint8' },
      { indexed: false, name: 'shares', type: 'uint256' },
      { indexed: false, name: 'nextBatchTime', type: 'uint256' },
    ],
    name: 'WithdrawQueued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'riskLevel', type: 'uint8' },
      { indexed: false, name: 'shares', type: 'uint256' },
    ],
    name: 'DepositClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'riskLevel', type: 'uint8' },
      { indexed: false, name: 'assets', type: 'uint256' },
    ],
    name: 'WithdrawClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'riskLevel', type: 'uint8' },
      { indexed: false, name: 'totalAmount', type: 'uint256' },
      { indexed: false, name: 'userCount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'BatchDepositsExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'riskLevel', type: 'uint8' },
      { indexed: false, name: 'totalShares', type: 'uint256' },
      { indexed: false, name: 'totalAssets', type: 'uint256' },
      { indexed: false, name: 'userCount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'BatchWithdrawsExecuted',
    type: 'event',
  },
] as const

// MockUSDC contract ABI - Standard ERC20 with mint function for testing
export const MOCK_USDC_ABI = [
  // Standard ERC20 functions
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
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
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  
  // Mock functions for testing
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Supported assets configuration
export const SUPPORTED_ASSETS = [
  {
    address: CONTRACTS.MOCK_USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '/tokens/usdc.svg',
  },
  {
    address: CONTRACTS.MOCK_USDT,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: '/tokens/usdt.svg',
  },
] as const

export type SupportedAsset = typeof SUPPORTED_ASSETS[number]