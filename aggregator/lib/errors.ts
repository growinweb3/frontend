import { Toast } from "@/hooks/use-toast";

type ToastFunction = (props: Toast) => void;

interface ErrorHandlerOptions {
  toast: { toast: ToastFunction }["toast"];
  action?: string;
}

/**
 * Handle wallet-related errors with user-friendly messages
 */
export function handleWalletError(error: Error, options: ErrorHandlerOptions) {
  const { toast, action = "connect" } = options;

  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes("not-connected") || errorMessage.includes("not connected")) {
    toast({
      variant: "destructive",
      title: "Wallet Not Connected",
      description: "Please connect your wallet to continue",
    });
    return;
  }

  if (errorMessage.includes("insufficient-balance") || errorMessage.includes("insufficient balance")) {
    toast({
      variant: "destructive",
      title: "Insufficient Balance",
      description: "You don't have enough tokens for this transaction",
    });
    return;
  }

  if (errorMessage.includes("invalid amount")) {
    toast({
      variant: "destructive",
      title: "Invalid Amount",
      description: "Please enter a valid amount greater than 0",
    });
    return;
  }

  if (errorMessage.includes("wrong network") || errorMessage.includes("unsupported chain")) {
    toast({
      variant: "destructive",
      title: "Wrong Network",
      description: "Please switch to Lisk Sepolia network",
    });
    return;
  }

  // Generic wallet error
  toast({
    variant: "destructive",
    title: "Wallet Error",
    description: error.message || "An error occurred with your wallet",
  });
}

/**
 * Handle transaction-related errors with user-friendly messages
 */
export function handleTransactionError(error: any, options: ErrorHandlerOptions) {
  const { toast, action = "transaction" } = options;

  console.error(`Transaction error (${action}):`, error);

  const errorMessage = error?.message?.toLowerCase() || "";
  const errorCode = error?.code;

  // User rejected transaction
  if (errorCode === 4001 || errorMessage.includes("user rejected") || errorMessage.includes("user denied")) {
    toast({
      variant: "destructive",
      title: "Transaction Cancelled",
      description: "You cancelled the transaction",
    });
    return;
  }

  // Insufficient funds for gas
  if (errorMessage.includes("insufficient funds") || errorMessage.includes("insufficient balance for transfer")) {
    toast({
      variant: "destructive",
      title: "Insufficient Funds",
      description: "You don't have enough ETH to pay for gas fees",
    });
    return;
  }

  // Contract execution reverted
  if (errorMessage.includes("execution reverted")) {
    // Try to extract revert reason
    const revertReason = extractRevertReason(errorMessage);
    toast({
      variant: "destructive",
      title: "Transaction Failed",
      description: revertReason || "The contract rejected this transaction",
    });
    return;
  }

  // Network/RPC errors
  if (errorMessage.includes("network") || errorMessage.includes("rpc")) {
    toast({
      variant: "destructive",
      title: "Network Error",
      description: "Failed to connect to the network. Please try again",
    });
    return;
  }

  // Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    toast({
      variant: "destructive",
      title: "Transaction Timeout",
      description: "The transaction took too long. Please check your wallet",
    });
    return;
  }

  // Generic transaction error
  toast({
    variant: "destructive",
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
    description: error?.shortMessage || error?.message || "An error occurred during the transaction",
  });
}

/**
 * Extract revert reason from error message
 */
function extractRevertReason(errorMessage: string): string | null {
  // Try to find common revert reason patterns
  const patterns = [
    /reverted with reason string '(.+?)'/i,
    /reverted with the following reason:\s*(.+?)$/i,
    /execution reverted:\s*(.+?)$/i,
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount: string | bigint, balance?: bigint): {
  isValid: boolean;
  error?: string;
} {
  try {
    const amountBigInt = typeof amount === "string" ? BigInt(amount) : amount;

    if (amountBigInt <= BigInt(0)) {
      return {
        isValid: false,
        error: "Amount must be greater than 0",
      };
    }

    if (balance !== undefined && amountBigInt > balance) {
      return {
        isValid: false,
        error: "Insufficient balance",
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "Invalid amount format",
    };
  }
}
