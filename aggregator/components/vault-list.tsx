"use client"

import { VaultType } from "@/lib/types"
import { getAllVaultTypes } from "@/lib/constants"
import { VaultCard } from "./vault-card"
import { useTotalValueLocked, useAssetAPY, useUserBalance } from "@/hooks/useContracts"
import { useAccount } from "wagmi"
import { CONTRACTS } from "@/lib/contracts"
import { formatUnits } from "viem"

interface VaultListProps {
  filter?: VaultType | "all"
  onVaultSelect?: (vaultType: VaultType) => void
}

export function VaultList({ filter = "all", onVaultSelect }: VaultListProps) {
  const { address } = useAccount()
  const vaultTypes = getAllVaultTypes()
  const filteredVaults = filter === "all" ? vaultTypes : vaultTypes.filter((type) => type === filter)

  // Get real contract data
  const { data: totalValueLocked } = useTotalValueLocked()
  const { data: assetAPY } = useAssetAPY(CONTRACTS.MOCK_USDC)
  const { data: userBalance } = useUserBalance(address, CONTRACTS.MOCK_USDC)

  // Calculate total deposited and current APY from contract
  const totalDeposited = totalValueLocked ? parseFloat(formatUnits(totalValueLocked, 6)) : 0
  const currentAPY = assetAPY ? parseFloat(formatUnits(assetAPY, 18)) : 0
  const userDeposit = userBalance ? parseFloat(formatUnits(userBalance, 6)) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVaults.map((vaultType) => {
        return (
          <VaultCard
            key={vaultType}
            vaultType={vaultType}
            totalDeposited={totalDeposited / 3} // Distribute across 3 vaults
            currentAPY={currentAPY}
            userDeposit={userDeposit / 3} // User balance distributed
            onDeposit={() => onVaultSelect?.(vaultType)}
          />
        )
      })}
    </div>
  )
}
