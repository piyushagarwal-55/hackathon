"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Trophy, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { POLL_ABI, MOCK_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { toast } from "sonner";
import { formatUnits } from "viem";

interface ClaimWinningsProps {
  pollAddress: `0x${string}`;
  options: string[];
}

export function ClaimWinnings({ pollAddress, options }: ClaimWinningsProps) {
  const { address, isConnected } = useAccount();
  const [estimatedPayout, setEstimatedPayout] = useState<string>("0");

  // Check if poll has ended
  const { data: endTime } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "endTime",
  });

  // Get user's vote
  const { data: userVote } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "votes",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Get winner info
  const { data: winnerInfo } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "getWinner",
    query: {
      enabled: !!pollAddress,
    },
  });

  // Check if user already claimed
  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Get user's bet amount
  const { data: userBet } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "userBets",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Get total bet amount (prize pool)
  const { data: totalBetAmount } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "totalBetAmount",
    query: {
      enabled: !!pollAddress,
    },
  });

  // Get token symbol
  const { data: tokenSymbol } = useReadContract({
    address: MOCK_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate estimated payout
  useEffect(() => {
    if (userVote && winnerInfo && userBet && totalBetAmount) {
      const [winningOption, winningVotes] = winnerInfo as [bigint, bigint];
      const userOption = userVote[0];
      const userWeightedVotes = userVote[2];

      // Check if user voted for winner
      if (userOption === winningOption && winningVotes > 0n) {
        // Calculate proportional share based on weighted votes
        const userShare = (userWeightedVotes * totalBetAmount) / winningVotes;
        setEstimatedPayout(formatUnits(userShare, 18));
      } else {
        setEstimatedPayout("0");
      }
    }
  }, [userVote, winnerInfo, userBet, totalBetAmount]);

  // Handle successful claim
  useEffect(() => {
    if (isSuccess && hash) {
      setTimeout(() => {
        refetchClaimed();
        toast.success(`🎉 Successfully claimed ${estimatedPayout} ${tokenSymbol || "REP"}!`);
      }, 2000);
    }
  }, [isSuccess, hash, refetchClaimed, estimatedPayout, tokenSymbol]);

  const handleClaim = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      writeContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: "claimWinnings",
        gas: 150000n, // Gas limit for claiming winnings
      });
      toast.info("Claim transaction submitted...");
    } catch (error: any) {
      toast.error(error.shortMessage || error.message || "Failed to claim winnings");
    }
  };

  // Check eligibility
  const isEnded = endTime ? BigInt(Date.now()) > endTime * 1000n : false;
  const hasVoted = userVote && userVote[3] > 0n;
  const isWinner =
    hasVoted &&
    winnerInfo &&
    userVote &&
    userVote[0] === (winnerInfo as [bigint, bigint])[0];
  const canClaim = isEnded && isWinner && !hasClaimed;
  const alreadyClaimed = hasClaimed === true;

  // Don't show if user hasn't voted
  if (!hasVoted) return null;

  // Don't show if poll is still active
  if (!isEnded) return null;

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg ${
            isWinner
              ? "bg-emerald-500/20 border border-emerald-500/40"
              : "bg-slate-700/20 border border-slate-700/40"
          }`}
        >
          {isWinner ? (
            <Trophy className="w-6 h-6 text-emerald-400" />
          ) : (
            <XCircle className="w-6 h-6 text-slate-400" />
          )}
        </div>

        <div className="flex-1">
          {isWinner ? (
            <>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">
                🎉 You Won!
              </h3>
              <p className="text-slate-300 mb-4">
                You voted for the winning option:{" "}
                <span className="font-semibold text-white">
                  {options[Number(userVote[0])]}
                </span>
              </p>

              {/* Prize Info */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-lg p-4 mb-4 border border-emerald-500/30">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Your Bet</p>
                    <p className="text-lg font-bold text-white">
                      {userBet ? formatUnits(userBet, 18) : "0"} {tokenSymbol || "REP"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Prize Pool</p>
                    <p className="text-lg font-bold text-white">
                      {totalBetAmount ? formatUnits(totalBetAmount, 18) : "0"}{" "}
                      {tokenSymbol || "REP"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-emerald-500/20">
                  <p className="text-xs text-slate-400 mb-1">Your Winnings</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {estimatedPayout} {tokenSymbol || "REP"}
                  </p>
                </div>
              </div>

              {/* Claim Button */}
              {alreadyClaimed ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-700/40 rounded-lg text-slate-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Already Claimed</span>
                </div>
              ) : canClaim ? (
                <button
                  onClick={handleClaim}
                  disabled={isPending || isConfirming}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {isPending ? "Confirm in wallet..." : "Claiming..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      <span>Claim {estimatedPayout} {tokenSymbol || "REP"}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-sm text-slate-400 text-center py-2">
                  Calculating winnings...
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                Not a Winner
              </h3>
              <p className="text-slate-400">
                You voted for:{" "}
                <span className="font-semibold text-slate-300">
                  {options[Number(userVote[0])]}
                </span>
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Unfortunately, this option didn't win. Better luck next time!
              </p>
              {userBet && userBet > 0n && (
                <p className="text-slate-500 text-sm mt-2">
                  Your bet: {formatUnits(userBet, 18)} {tokenSymbol || "REP"}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

