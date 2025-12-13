"use client";

import { useState } from "react";
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

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleFaucet = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsRequesting(true);
      writeContract({
        address: MOCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "faucet",
      });

      toast.success("Faucet request submitted!");
    } catch (error: any) {
      console.error("Faucet error:", error);
      toast.error(error?.message || "Failed to request tokens");
      setIsRequesting(false);
    }
  };

  // Handle confirmation
  if (isConfirmed && isRequesting) {
    setIsRequesting(false);
    refetchBalance();
    toast.success("1000 REP tokens received! 🎉");
  }

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
        ⚠️ Testnet only - Free mock tokens for demo
      </p>
    </div>
  );
}

