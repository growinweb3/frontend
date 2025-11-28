"use client";

import { createConfig, http } from "wagmi";
import { liskSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import type { Config } from "wagmi";

/**
 * Creates wagmi configuration for the application
 * This should only be called on the client side
 */
export function getClientConfig(): Config {
  return createConfig({
    chains: [liskSepolia],
    connectors: [
      injected({ target: "metaMask" }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
        showQrModal: true,
      }),
    ],
    transports: {
      [liskSepolia.id]: http("https://rpc.sepolia-api.lisk.com"),
    },
  });
}

/**
 * Chain configuration (re-exported for convenience)
 */
export { liskSepolia } from "wagmi/chains";

/**
 * Block explorer URL helper
 */
export function getExplorerUrl(type: "tx" | "address", value: string): string {
  const baseUrl = "https://sepolia-blockscout.lisk.com";
  return `${baseUrl}/${type}/${value}`;
}
