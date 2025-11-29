"use client"

import { VaultType } from "@/lib/types"
import { getAllVaultTypes } from "@/lib/constants"
import { VaultCard } from "./vault-card"
import { useAccount } from "wagmi"
import { CONTRACTS } from "@/lib/contracts"

interface VaultListProps {
  filter?: VaultType | "all"
  onVaultSelect?: (vaultType: VaultType) => void
}

export function VaultList({ filter = "all", onVaultSelect }: VaultListProps) {
  const { address } = useAccount()
  const vaultTypes = getAllVaultTypes()
  const filteredVaults = filter === "all" ? vaultTypes : vaultTypes.filter((type) => type === filter)

  // Get real contract data - removed as VaultCard now fetches its own data


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVaults.map((vaultType) => {
        return (
          <VaultCard
            key={vaultType}
            vaultType={vaultType}
            onDeposit={() => onVaultSelect?.(vaultType)}
          />
        )
      })}
    </div>
  )
}
