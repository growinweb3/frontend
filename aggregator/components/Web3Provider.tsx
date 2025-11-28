"use client";

import { createContext, useContext, type ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type Config, useWriteContract } from "wagmi";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { XellarKitProvider, defaultConfig, darkTheme, useConnectModal } from "@xellar/kit";
import { liskSepolia } from "@/lib/client-config";
import { useToast } from "@/hooks/use-toast";
import { handleWalletError, handleTransactionError, validateAmount } from "@/lib/errors";
import { CONTRACTS, ROUTER_ABI, MOCK_USDC_ABI } from "@/lib/contracts";
import type { Address } from "viem";

// Create QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      gcTime: 5 * 60_000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

type DepositParams = {
  vaultType: string; // VaultType enum value (conservative, balanced, aggressive)
  amount: bigint;
  assetSymbol?: string;
};

type WithdrawParams = {
  vaultType: string; // VaultType enum value (conservative, balanced, aggressive)
  shares: bigint; // Amount of vault shares to withdraw
  assetSymbol?: string;
};

type ApproveParams = {
  tokenAddress: Address;
  spender: Address;
  amount: bigint;
};

type WalletContextType = {
  address: Address | undefined;
  isConnected: boolean;
  chainId: number | undefined;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  deposit: (params: DepositParams) => Promise<{ txHash: string }>;
  withdraw: (params: WithdrawParams) => Promise<{ txHash: string }>;
  approveToken: (params: ApproveParams) => Promise<{ txHash: string }>;
  mintTestTokens: (tokenAddress: Address, amount: bigint) => Promise<{ txHash: string }>;
  isTransacting: boolean;
};

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  chainId: undefined,
  balance: "0",
  connect: async () => {
    console.warn("Connect function should be triggered by XellarKit UI components.");
  },
  disconnect: () => {},
  deposit: async () => ({ txHash: "0x0" }),
  withdraw: async () => ({ txHash: "0x0" }),
  approveToken: async () => ({ txHash: "0x0" }),
  mintTestTokens: async () => ({ txHash: "0x0" }),
  isTransacting: false,
});

export const useWallet = () => useContext(WalletContext);

// Inner component to handle context logic and wagmi hooks
function WalletStateController({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isTransacting, setIsTransacting] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>();

  const { address, isConnected, status, chainId } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const { open: openConnectModal } = useConnectModal();

  const balance = balanceData?.formatted ?? "0";

  // Monitor wallet connection status
  useEffect(() => {
    if (status === "connected") {
      console.log("Wallet connected successfully:", address);
      console.log("Chain ID:", chainId);

      // Check if on correct network
      if (chainId !== liskSepolia.id) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: `Please switch to Lisk Sepolia network`,
        });
      }
    } else if (status === "disconnected") {
      console.log("Wallet disconnected");
    }
  }, [status, address, chainId, toast]);

  const connect = async () => {
    console.log("Opening wallet connection modal...");
    openConnectModal();
  };

  const disconnect = () => {
    wagmiDisconnect();
    console.log("Wallet disconnect initiated");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const deposit = async (params: DepositParams): Promise<{ txHash: string }> => {
    const { vaultType, amount, assetSymbol = "USDC" } = params;

    // Validation
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      handleWalletError(new Error(validation.error || "Invalid amount"), { toast });
      throw new Error(validation.error);
    }

    if (!isConnected || !address) {
      handleWalletError(new Error("not-connected"), { toast });
      throw new Error("Wallet not connected");
    }

    if (chainId !== liskSepolia.id) {
      handleWalletError(new Error("wrong network"), { toast });
      throw new Error("Wrong network");
    }

    setIsTransacting(true);

    try {
      // Convert VaultType to RiskLevel (0=Conservative, 1=Balanced, 2=Aggressive)
      const { vaultTypeToRiskLevel } = await import("@/lib/utils");
      const riskLevel = vaultTypeToRiskLevel(vaultType);

      toast({
        title: "Queuing Deposit...",
        description: `Your deposit will be processed in the next batch`,
      });

      const txHash = await writeContractAsync({
        address: CONTRACTS.ROUTER,
        abi: ROUTER_ABI,
        functionName: "deposit",
        args: [amount, riskLevel],
      });

      setLastTxHash(txHash);

      toast({
        title: "Deposit Queued! 🎉",
        description: (
          <div className="flex flex-col gap-1">
            <p>Your deposit is queued for the next batch execution</p>
            <a
              href={getExplorerUrl("tx", txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:underline"
            >
              View on Explorer →
            </a>
          </div>
        ),
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["usePortfolioValue"] });
      queryClient.invalidateQueries({ queryKey: ["useUserBalance"] });
      queryClient.invalidateQueries({ queryKey: ["useTVL"] });

      return { txHash };
    } catch (error: any) {
      console.error("Deposit error:", error);
      handleTransactionError(error, { toast, action: "deposit" });
      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  const withdraw = async (params: WithdrawParams): Promise<{ txHash: string }> => {
    const { vaultType, shares, assetSymbol = "USDC" } = params;

    // Validation
    const validation = validateAmount(shares);
    if (!validation.isValid) {
      handleWalletError(new Error(validation.error || "Invalid amount"), { toast });
      throw new Error(validation.error);
    }

    if (!isConnected || !address) {
      handleWalletError(new Error("not-connected"), { toast });
      throw new Error("Wallet not connected");
    }

    if (chainId !== liskSepolia.id) {
      handleWalletError(new Error("wrong network"), { toast });
      throw new Error("Wrong network");
    }

    setIsTransacting(true);

    try {
      // Convert VaultType to RiskLevel (0=Conservative, 1=Balanced, 2=Aggressive)
      const { vaultTypeToRiskLevel } = await import("@/lib/utils");
      const riskLevel = vaultTypeToRiskLevel(vaultType);

      toast({
        title: "Queuing Withdrawal...",
        description: `Your withdrawal will be processed in the next batch`,
      });

      const txHash = await writeContractAsync({
        address: CONTRACTS.ROUTER,
        abi: ROUTER_ABI,
        functionName: "withdraw",
        args: [shares, riskLevel],
      });

      setLastTxHash(txHash);

      toast({
        title: "Withdrawal Queued! 🎉",
        description: (
          <div className="flex flex-col gap-1">
            <p>Your withdrawal is queued for the next batch execution</p>
            <a
              href={getExplorerUrl("tx", txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:underline"
            >
              View on Explorer →
            </a>
          </div>
        ),
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["usePortfolioValue"] });
      queryClient.invalidateQueries({ queryKey: ["useUserBalance"] });
      queryClient.invalidateQueries({ queryKey: ["useTVL"] });

      return { txHash };
    } catch (error: any) {
      console.error("Withdraw error:", error);
      handleTransactionError(error, { toast, action: "withdraw" });
      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  const approveToken = async (params: ApproveParams): Promise<{ txHash: string }> => {
    const { tokenAddress, spender, amount } = params;

    if (!isConnected || !address) {
      handleWalletError(new Error("not-connected"), { toast });
      throw new Error("Wallet not connected");
    }

    setIsTransacting(true);

    try {
      toast({
        title: "Approving...",
        description: `Please confirm the approval in your wallet`,
      });

      const txHash = await writeContractAsync({
        address: tokenAddress,
        abi: MOCK_USDC_ABI,
        functionName: "approve",
        args: [spender, amount],
      });

      setLastTxHash(txHash);

      toast({
        title: "Approval Successful! ✅",
        description: "Token approval confirmed",
      });

      // Invalidate allowance queries
      queryClient.invalidateQueries({ queryKey: ["allowance"] });

      return { txHash };
    } catch (error: any) {
      console.error("Approve error:", error);
      handleTransactionError(error, { toast, action: "approve" });
      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  const mintTestTokens = async (tokenAddress: Address, amount: bigint): Promise<{ txHash: string }> => {
    if (!isConnected || !address) {
      handleWalletError(new Error("not-connected"), { toast });
      throw new Error("Wallet not connected");
    }

    setIsTransacting(true);

    try {
      toast({
        title: "Minting Test Tokens...",
        description: `Please confirm the transaction in your wallet`,
      });

      const txHash = await writeContractAsync({
        address: tokenAddress,
        abi: MOCK_USDC_ABI,
        functionName: "mint",
        args: [address, amount],
      });

      setLastTxHash(txHash);

      toast({
        title: "Tokens Minted! 🪙",
        description: "Test tokens have been added to your wallet",
      });

      // Invalidate balance queries
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });

      return { txHash };
    } catch (error: any) {
      console.error("Mint error:", error);
      handleTransactionError(error, { toast, action: "mint" });
      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        chainId,
        balance,
        connect,
        disconnect,
        deposit,
        withdraw,
        approveToken,
        mintTestTokens,
        isTransacting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    // Only create config on client side
    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
    const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID || "";

    const clientConfig = defaultConfig({
      appName: "Growish",
      walletConnectProjectId,
      xellarAppId,
      xellarEnv: "sandbox",
      chains: [liskSepolia],
    }) as Config;

    setConfig(clientConfig);
    // Use setTimeout to ensure state update happens after render
    setTimeout(() => setMounted(true), 0);
  }, []);

  // Don't render providers until we have config
  if (!config) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider config={config} theme={darkTheme}>
          <WalletStateController>
            {mounted ? children : null}
          </WalletStateController>
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}