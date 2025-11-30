import { VaultType, Protocol, type VaultConfig, type ProtocolInfo, type TokenInfo } from "./types"

// Network Configuration
export const LISK_SEPOLIA_CHAIN_ID = 4202
export const LISK_MAINNET_CHAIN_ID = 1135

// USDC Token Configuration (Lisk Sepolia Testnet)
export const USDC_TOKEN: TokenInfo = {
  symbol: "USDC",
  name: "USD Coin",
  address: "0x6f576F9A89555b028ce97581DA6d10e35d433F04",
  decimals: 6,
  logo: "/tokens/usdc.svg",
}

// Protocol Configurations
export const PROTOCOLS: Record<Protocol, ProtocolInfo> = {
  [Protocol.AAVE_V3]: {
    id: Protocol.AAVE_V3,
    name: "aave",
    displayName: "Aave V3",
    version: "3.0",
    description: "Leading decentralized lending protocol with battle-tested security and high liquidity.",
    contractAddress: "0x53175d08E96a961233ea333385EA74E74C556Cf1",
    auditStatus: "Audited",
    auditor: "OpenZeppelin, Trail of Bits, ABDK",
    auditDate: "2024-Q2",
    riskScore: 2.5,
    tvl: "$8.2B",
    baseAPY: 4.2,
  },
  [Protocol.COMPOUND_V3]: {
    id: Protocol.COMPOUND_V3,
    name: "compound",
    displayName: "Compound V3",
    version: "3.0",
    description: "Efficient money market protocol optimized for USDC with streamlined risk management.",
    contractAddress: "0x831f464C241eAa6CcF72F5570c7F5E5f9759317e",
    auditStatus: "Audited",
    auditor: "OpenZeppelin, ChainSecurity",
    auditDate: "2024-Q1",
    riskScore: 3.0,
    tvl: "$3.5B",
    baseAPY: 5.8,
  },
}

// Vault Configurations
export const VAULT_CONFIGS: Record<VaultType, VaultConfig> = {
  [VaultType.CONSERVATIVE]: {
    type: VaultType.CONSERVATIVE,
    name: "Conservative Vault",
    description: "Low-risk strategy prioritizing capital preservation with steady yields from established protocols.",
    riskLevel: "Low",
    contractAddress: "0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c",
    targetAPY: {
      min: 3.5,
      max: 5.0,
    },
    allocation: {
      aave: 80,
      compound: 20,
    },
    rebalanceThreshold: 6, // Protocol rebalancing threshold
    batchScheduleHours: 1, // Batch deposits every 1 hour to reduce gas fees
  },
  [VaultType.BALANCED]: {
    type: VaultType.BALANCED,
    name: "Balanced Vault",
    description: "Balanced risk-reward approach with diversified exposure across both protocols.",
    riskLevel: "Medium",
    contractAddress: "0x21AF332B10481972B903cBd6C3f1ec51546552e7",
    targetAPY: {
      min: 4.5,
      max: 6.5,
    },
    allocation: {
      aave: 50,
      compound: 50,
    },
    rebalanceThreshold: 4, // Protocol rebalancing threshold
    batchScheduleHours: 1, // Batch deposits every 1 hour to reduce gas fees
  },
  [VaultType.AGGRESSIVE]: {
    type: VaultType.AGGRESSIVE,
    name: "Aggressive Vault",
    description: "Higher risk strategy maximizing yields by favoring protocols with the highest APY potential.",
    riskLevel: "High",
    contractAddress: "0xc4E50772bd6d27661EE12d81e62Daa4882F4E6f4",
    targetAPY: {
      min: 5.5,
      max: 8.0,
    },
    allocation: {
      aave: 30,
      compound: 70,
    },
    rebalanceThreshold: 2, // Protocol rebalancing threshold
    batchScheduleHours: 1, // Batch deposits every 1 hour to reduce gas fees
  },
}

// Helper functions
export function getVaultConfig(vaultType: VaultType): VaultConfig {
  return VAULT_CONFIGS[vaultType]
}

export function getProtocolInfo(protocol: Protocol): ProtocolInfo {
  return PROTOCOLS[protocol]
}

export function getAllVaultTypes(): VaultType[] {
  return [VaultType.CONSERVATIVE, VaultType.BALANCED, VaultType.AGGRESSIVE]
}

export function getAllProtocols(): Protocol[] {
  return [Protocol.AAVE_V3, Protocol.COMPOUND_V3]
}

// Risk Level Color Mapping
export const RISK_COLORS = {
  Low: "text-emerald-400",
  Medium: "text-yellow-400",
  High: "text-orange-400",
} as const

// Vault Type Color Mapping
export const VAULT_COLORS = {
  [VaultType.CONSERVATIVE]: "emerald",
  [VaultType.BALANCED]: "cyan",
  [VaultType.AGGRESSIVE]: "orange",
} as const
