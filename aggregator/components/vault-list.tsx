"use client"

import { VaultType } from "@/lib/types"
import { getAllVaultTypes } from "@/lib/constants"
import VaultCard from "./vault-card"
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

  // Debug logging to trace vault type propagation
  console.log('[VaultList Debug] All vault types:', vaultTypes)
  console.log('[VaultList Debug] Filter:', filter)
  console.log('[VaultList Debug] Filtered vaults:', filteredVaults)
  console.log('[VaultList Debug] VaultType enum values:', {
    CONSERVATIVE: VaultType.CONSERVATIVE,
    BALANCED: VaultType.BALANCED,
    AGGRESSIVE: VaultType.AGGRESSIVE
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVaults.map((vaultType, index) => {
        // Strict type assertion with additional logging
        const strictType: VaultType = vaultType as VaultType
        console.log(`[VaultList] Mapping vault ${index}:`, {
          originalType: vaultType,
          strictType,
          typeMatch: vaultType === strictType,
          typeOf: typeof vaultType
        })
        
        return (
          <VaultCard
            key={`${vaultType}-${index}`}
            vaultType={strictType}
            onDeposit={() => onVaultSelect?.(strictType)}
          />
        )
      })}
    </div>
  )
}
