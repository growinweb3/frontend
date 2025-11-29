"use client";

import { createContext, useContext, type ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type Config, useAccount, useDisconnect, useBalance, useWriteContract, usePublicClient } from "wagmi";
import { XellarKitProvider, defaultConfig, darkTheme, useConnectModal } from "@xellar/kit";
import { liskSepolia, getExplorerUrl } from "@/lib/client-config";
import { useToast } from "@/hooks/use-toast";
import { handleWalletError, validateAmount } from "@/lib/errors";
import { CONTRACTS, ROUTER_ABI, USDC_ABI } from "@/lib/contracts";
import { vaultTypeToRiskLevel } from "@/lib/utils";
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
  vaultType: string;
  amount: bigint;
  assetSymbol?: string;
};

type WithdrawParams = {
  vaultType: string;
  shares: bigint;
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
  disconnect: () => { },
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
  const { open: openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const balance = balanceData?.value
    ? (Number(balanceData.value) / 10 ** (balanceData.decimals ?? 18)).toFixed(4)
    : "0.0000";

  // Monitor wallet connection status
  useEffect(() => {
    if (status === "connected") {
      console.log("Wallet connected successfully:", address);

      // Check if on correct network
      if (chainId !== liskSepolia.id) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: `Please switch to Lisk Sepolia network`,
        });
      }
    }
  }, [status, address, chainId, toast]);

  const connect = async () => {
    openConnectModal();
  };

  const disconnect = () => {
    wagmiDisconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const deposit = async (params: DepositParams): Promise<{ txHash: string }> => {
    const { vaultType, amount, assetSymbol = "USDC" } = params;

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
      const riskLevel = vaultTypeToRiskLevel(vaultType);

      // Check allowance first
      if (publicClient) {
        const allowance = await publicClient.readContract({
          address: CONTRACTS.MOCK_USDC as Address,
          abi: USDC_ABI,
          functionName: "allowance",
          args: [address, CONTRACTS.ROUTER as Address],
        }) as bigint;

        if (allowance < amount) {
          const error = `Insufficient ${assetSymbol} allowance. Please approve ${assetSymbol} spending first.`;
          toast({
            variant: "destructive",
            title: "Approval Required",
            description: error,
          });
          throw new Error(error);
        }
      }

      toast({
        title: "Queuing Deposit...",
        description: `Your deposit will be processed in the next batch`,
      });

      const txHash = await writeContractAsync({
        address: CONTRACTS.ROUTER as Address,
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
      queryClient.invalidateQueries({ queryKey: ["usePendingDeposit"] });
      queryClient.invalidateQueries({ queryKey: ["useTokenBalance"] });

      return { txHash };
    } catch (error: any) {
      console.error("Deposit error:", error);
      handleWalletError(error, { toast });
      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  const withdraw = async (params: WithdrawParams): Promise<{ txHash: string }> => {
    const { vaultType, shares } = params;

    const validation = validateAmount(shares);
    if (!validation.isValid) {
      handleWalletError(new Error(validation.error || "Invalid amount"), { toast });
      throw new Error(validation.error);
    }

    if (!isConnected || !address) {
      handleWalletError(new Error("not-connected"), { toast });
      throw new Error("Wallet not connected");
    }

    setIsTransacting(true);

    try {
      const riskLevel = vaultTypeToRiskLevel(vaultType);

      // Note: Withdraw usually doesn't require allowance if it's burning shares, 
      // but if Router transfersFrom Vault, it might. 
      // Based on brief: "Approve Vault Shares: User harus approve Router"

      // We should ideally check allowance here too, but for now let's assume UI handles approval flow
      // or we can add it here if we know the Vault address easily.
      // Since we don't have vault address passed in params easily (only type), 
      // and fetching it async might be complex here, we'll rely on the contract call failing 
      // or the UI handling the approval step (which VaultInteraction.tsx does).

      toast({
        title: "Queuing Withdrawal...",
        description: `Your withdrawal will be processed in the next batch`,
      });

      const txHash = await writeContractAsync({
        address: CONTRACTS.ROUTER as Address,
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

      queryClient.invalidateQueries({ queryKey: ["usePendingWithdraw"] });

      return { txHash };
    } catch (error: any) {
      console.error("Withdraw error:", error);
      handleWalletError(error, { toast });
      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  const approveToken = async (params: ApproveParams): Promise<{ txHash: string }> => {
    const { tokenAddress, spender, amount } = params;

    if (!isConnected) {
      handleWalletError(new Error("not-connected"), { toast });
      throw new Error("Wallet not connected");
    }

    setIsTransacting(true);

    try {
      const txHash = await writeContractAsync({
        address: tokenAddress,
        abi: USDC_ABI, // ERC20 ABI
        functionName: "approve",
        args: [spender, amount],
      });

      toast({
        title: "Approval Successful! ✅",
        description: "Token approval confirmed",
      });

      return { txHash };
    } catch (error: any) {
      console.error("Approval error:", error);
      handleWalletError(error, { toast });
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
      const txHash = await writeContractAsync({
        address: tokenAddress,
        abi: USDC_ABI,
        functionName: "mint",
        args: [address, amount],
      });

      toast({
        title: "Tokens Minted! 🪙",
        description: "Test tokens have been added to your wallet",
      });

      return { txHash };
    } catch (error: any) {
      console.error("Mint error:", error);
      handleWalletError(error, { toast });
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
  const [missingEnv, setMissingEnv] = useState<string[]>([]);

  useEffect(() => {
    // Only create config on client side
    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
    const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID || "";

    const missing = [];
    if (!walletConnectProjectId) missing.push("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID");
    if (!xellarAppId) missing.push("NEXT_PUBLIC_XELLAR_APP_ID");

    if (missing.length > 0) {
      setMissingEnv(missing);
      return;
    }

    const clientConfig = defaultConfig({
      appName: "Growish",
      walletConnectProjectId,
      xellarAppId,
      xellarEnv: "sandbox",
      chains: [liskSepolia],
    }) as Config;

    setConfig(clientConfig);
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (missingEnv.length > 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="max-w-md p-6 border border-red-500 rounded-lg bg-red-950/30">
          <h2 className="text-xl font-bold text-red-500 mb-4">Missing Configuration</h2>
          <p className="mb-4">
            Please set the following environment variables in your <code className="bg-gray-800 px-1 py-0.5 rounded">.env</code> file:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
            {missingEnv.map((env) => (
              <li key={env}>{env}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={darkTheme}>
          <WalletStateController>
            {mounted ? children : null}
          </WalletStateController>
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}