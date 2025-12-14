"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Coins, Loader2 } from "lucide-react";
import { MOCK_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { toast } from "sonner";
import { formatUnits } from "viem";

export function TokenFaucet() {
  const { address } = useAccount();
  const [isRequesting, setIsRequesting] = useState(false);

  // Fetch user's token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: MOCK_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Fetch token symbol
  const { data: symbol } = useReadContract({
    address: MOCK_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  const { writeContract, data: hash, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle confirmation in useEffect (proper way)
  useEffect(() => {
    if (isConfirmed && hash) {
      console.log("Faucet transaction confirmed!");
      toast.success("1000 REP tokens received! 🎉");
      
      // Wait a bit for blockchain to update, then refetch
      setTimeout(() => {
        refetchBalance();
        setIsRequesting(false);
        reset();
      }, 1000);
    }
  }, [isConfirmed, hash, refetchBalance, reset]);

  // Handle when user rejects or transaction fails
  useEffect(() => {
    if (!isPending && !isConfirming && isRequesting && !hash) {
      // User likely rejected the transaction
      setIsRequesting(false);
    }
  }, [isPending, isConfirming, isRequesting, hash]);

  const handleFaucet = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsRequesting(true);
      console.log("Requesting tokens from faucet...");
      
      writeContract({
        address: MOCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "faucet",
        gas: 100000n, // Add gas limit
      });

      toast.info("Please confirm the transaction in MetaMask");
    } catch (error: any) {
      console.error("Faucet error:", error);
      
      // Parse specific error messages
      const errorMsg = error?.message || error?.shortMessage || '';
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('User denied')) {
        toast.error("Transaction cancelled");
      } else if (errorMsg.includes('CooldownActive')) {
        toast.error("⏰ Cooldown active - please wait before claiming again");
      } else if (errorMsg.includes('FaucetDisabled')) {
        toast.error("🚫 Faucet is currently disabled");
      } else if (errorMsg.includes('MaxSupplyExceeded')) {
        toast.error("📊 Maximum supply reached");
      } else {
        toast.error(error?.shortMessage || "Failed to request tokens");
      }
      setIsRequesting(false);
    }
  };

  const formattedBalance = balance
    ? parseFloat(formatUnits(balance, 18)).toFixed(2)
    : "0.00";

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium text-white">Your Balance</span>
        </div>
        <div className="text-lg font-bold text-emerald-400">
          {formattedBalance} {symbol || "REP"}
        </div>
      </div>

      <button
        onClick={handleFaucet}
        disabled={!address || isPending || isConfirming || isRequesting}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isPending || isConfirming || isRequesting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {isPending ? "Confirm in wallet..." : "Minting tokens..."}
            </span>
          </>
        ) : (
          <>
            <Coins className="h-4 w-4" />
            <span>Get 1000 Free REP</span>
          </>
        )}
      </button>

      <p className="text-xs text-slate-400 mt-2 text-center">
        ⚠️ Testnet only • Unlimited free tokens
      </p>
    </div>
  );
}