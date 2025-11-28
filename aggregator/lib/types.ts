// Vault Types
export enum VaultType {
  CONSERVATIVE = "conservative",
  BALANCED = "balanced",
  AGGRESSIVE = "aggressive",
}

export interface VaultConfig {
  type: VaultType
  name: string
  description: string
  riskLevel: "Low" | "Medium" | "High"
  contractAddress: string // Vault contract address on Lisk Sepolia
  targetAPY: {
    min: number
    max: number
  }
  allocation: {
    aave: number
    compound: number
  }
  rebalanceThreshold: number // Legacy field - used for protocol rebalancing logic
  batchScheduleHours: number // Batch deposit interval in hours
  nextBatchTime?: Date // Calculated next batch execution time
}

// Protocol Types
export enum Protocol {
  AAVE_V3 = "aave_v3",
  COMPOUND_V3 = "compound_v3",
}

export interface ProtocolInfo {
  id: Protocol
  name: string
  displayName: string
  version: string
  description: string
  contractAddress: string
  auditStatus: "Audited" | "Unaudited"
  auditor?: string
  auditDate?: string
  riskScore: number
  tvl: string
  baseAPY: number
}

// Token Types
export interface TokenInfo {
  symbol: string
  name: string
  address: string
  decimals: number
  logo: string
}

// Vault Instance
export interface Vault {
  id: string
  config: VaultConfig
  totalDeposited: number
  currentAPY: number
  protocolBreakdown: {
    protocol: Protocol
    amount: number
    apy: number
    percentage: number
  }[]
  lastRebalance: Date
  nextRebalance: Date
}

// User Position
export interface UserPosition {
  vaultId: string
  vaultType: VaultType
  depositedAmount: number
  currentValue: number
  earnedYield: number
  depositDate: Date
  apy: number
}

// Yield Opportunity
export interface YieldOpportunity {
  id: string
  protocol: Protocol
  protocolName: string
  token: string
  apy: number
  tvl: string
  chain: string
  vaultType?: VaultType
  riskLevel: "Low" | "Medium" | "High"
}

// Transaction
export interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "yield" | "rebalance"
  vaultType: VaultType
  vaultName: string
  amount: number
  token: string
  timestamp: Date
  status: "completed" | "pending" | "failed"
  txHash?: string
}

// Portfolio Stats
export interface PortfolioStats {
  totalUSDC: number
  totalYieldEarned: number
  averageAPY: number
  positionCount: number
  vaultDistribution: {
    vaultType: VaultType
    amount: number
    percentage: number
  }[]
}
