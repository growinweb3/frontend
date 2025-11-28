"use client";

import { ConnectButton } from "@xellar/kit";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ExternalLink } from "lucide-react";
import { NetworkStatus } from "./NetworkStatus";
import { useWallet } from "./Web3Provider";
import { getExplorerUrl } from "@/lib/client-config";

export function ConnectWallet() {
  const { address, isConnected, disconnect } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <NetworkStatus />

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-white/80">{formatAddress(address)}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getExplorerUrl("address", address), "_blank")}
          className="p-2 border-white/20 hover:border-white/40"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="p-2 border-white/20 hover:border-white/40"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ isConnected, account, chain, openConnectModal }) => (
        <Button
          onClick={openConnectModal}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/20"
        >
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </div>
        </Button>
      )}
    </ConnectButton.Custom>
  );
}