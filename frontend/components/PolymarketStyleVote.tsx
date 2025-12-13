'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, POLL_ABI, MOCK_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { calculateVoteWeight, formatNumber, getReputationLevel } from '@/lib/calculations';
import { toast } from 'sonner';
import { CheckCircle2, TrendingUp, Info, Zap, Scale } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { MarketChart } from './MarketChart';
import { TokenFaucet } from './TokenFaucet';
import { parseUnits, formatUnits } from 'viem';

interface PolymarketStyleVoteProps {
  pollAddress: `0x${string}`;
  options: string[];
  question: string;
  onVoteSuccess?: () => void;
}

type VotingMethod = 'simple' | 'quadratic' | 'weighted';

export function PolymarketStyleVote({ pollAddress, options, question, onVoteSuccess }: PolymarketStyleVoteProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [creditsSpent, setCreditsSpent] = useState(10);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [votingMethod, setVotingMethod] = useState<VotingMethod>('quadratic');
  const [showMethodInfo, setShowMethodInfo] = useState(false);
  const queryClient = useQueryClient();

  // Get user's reputation multiplier
  const { data: multiplier } = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'getRepMultiplier',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Get user's token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: MOCK_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000,
    },
  });

  // Get token allowance
  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: MOCK_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && pollAddress ? [address, pollAddress] : undefined,
    query: {
      enabled: !!address && isConnected && !isZeroAddress,
      refetchInterval: 10000,
    },
  });

  // Check if user already voted
  const isZeroAddress = pollAddress === '0x0000000000000000000000000000000000000000';
  const { data: existingVote, refetch: refetchVote, queryKey: voteQueryKey } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'votes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && !isZeroAddress,
      refetchInterval: 5000,
      staleTime: 2000,
    },
  });

  // Get results
  const { data: results } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'getResults',
    query: {
      enabled: !isZeroAddress,
      refetchInterval: 5000,
    },
  });

  const { data: totalVoters } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'totalVoters',
    query: {
      enabled: !isZeroAddress,
      refetchInterval: 5000,
    },
  });

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const hasVoted = existingVote && existingVote[3] > 0n;

  useEffect(() => {
    if (isSuccess && hash) {
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          predicate: (query) => JSON.stringify(query.queryKey).includes(pollAddress.toLowerCase())
        });
        refetchVote();
        refetchBalance();
        refetchAllowance();
        if (onVoteSuccess) onVoteSuccess();
        toast.success('✅ Vote successfully recorded!');
      }, 2000);
    }
  }, [isSuccess, refetchVote, refetchBalance, refetchAllowance, onVoteSuccess, hash, queryClient, pollAddress]);

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    const tokenAmount = parseUnits(creditsSpent.toString(), 18);

    try {
      writeContract({
        address: MOCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [pollAddress, tokenAmount],
      });
      toast.info('Approval transaction submitted...');
    } catch (error: any) {
      toast.error(error.shortMessage || error.message || 'Failed to approve tokens');
    }
  };

  const handleVote = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    const tokenAmount = parseUnits(creditsSpent.toString(), 18);

    // Check if user has enough tokens
    if (tokenBalance && tokenBalance < tokenAmount) {
      toast.error('Insufficient REP tokens. Get free tokens from the faucet!');
      return;
    }

    // Check if approval is needed
    if (!tokenAllowance || tokenAllowance < tokenAmount) {
      toast.error('Please approve REP tokens first');
      return;
    }

    try {
      writeContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: 'vote',
        args: [BigInt(selectedOption), tokenAmount],
      });
      toast.info('Vote transaction submitted...');
    } catch (error: any) {
      toast.error(error.shortMessage || error.message || 'Failed to cast vote');
    }
  };

  // Calculate vote weight based on method
  const calculateMethodWeight = (credits: number, repMultiplier: bigint) => {
    const repValue = Number(repMultiplier) / 1e18;
    switch (votingMethod) {
      case 'simple':
        return credits * repValue; // Linear: credits × reputation
      case 'quadratic':
        return Math.sqrt(credits) * repValue; // Quadratic: √credits × reputation
      case 'weighted':
        return credits * repValue * 1.5; // Weighted: credits × reputation × 1.5
      default:
        return Math.sqrt(credits) * repValue;
    }
  };

  const weightedVotes = multiplier ? calculateMethodWeight(creditsSpent, multiplier) : 0;
  const multiplierValue = multiplier ? (Number(multiplier) / 1e18) : 1;
  const { level: repLevel, color: repColor } = getReputationLevel(multiplier || BigInt(0));

  const totalVotes = results ? results.reduce((sum, votes) => sum + Number(votes), 0) : 0;
  const optionPercentages = results ? results.map(votes => 
    totalVotes > 0 ? (Number(votes) / totalVotes) * 100 : 0
  ) : [];

  // Get poll info
  const { data: pollEndTime } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'endTime',
    query: { enabled: !isZeroAddress },
  });

  const { data: pollIsActive } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'isActive',
    query: { enabled: !isZeroAddress },
  });

  const { data: maxWeightCap } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'maxWeightCap',
    query: { enabled: !isZeroAddress },
  });

  const isEnded = pollEndTime ? BigInt(Date.now()) > pollEndTime * 1000n : false;
  const timeRemaining = pollEndTime ? Number(pollEndTime) - Math.floor(Date.now() / 1000) : 0;
  const daysLeft = Math.floor(timeRemaining / 86400);
  const hoursLeft = Math.floor((timeRemaining % 86400) / 3600);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Chart and Stats */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-3">{question}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Volume:</span>
                  <span className="font-bold text-white">${formatNumber(totalVotes * 100)}</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Voters:</span>
                  <span className="font-bold text-white">{totalVoters?.toString() || '0'}</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div className="flex items-center gap-2">
                  {isEnded ? (
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 text-xs font-semibold">
                      Ended
                    </span>
                  ) : (
                    <>
                      <span className="text-slate-400">Ends in:</span>
                      <span className="font-bold text-emerald-400">
                        {daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h` : `${hoursLeft}h`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {maxWeightCap && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                <div className="text-xs text-purple-300">Weight Cap</div>
                <div className="text-lg font-bold text-purple-400">{maxWeightCap.toString()}x</div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Chart */}
        {results && results.length > 0 && (
          <MarketChart 
            results={results}
            options={options}
            totalVoters={totalVoters || BigInt(0)}
          />
        )}
      </div>

      {/* Right Column - Trading Panel */}
      <div className="space-y-4">
        <div className="sticky top-24 bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          {hasVoted ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Vote Recorded</h3>
              <p className="text-slate-400 text-sm mb-4">
                Your choice: <span className="text-emerald-400 font-semibold">{options[Number(existingVote[0])]}</span>
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/40">
                <p className="text-slate-500 text-xs mb-1">Vote Weight</p>
                <p className="text-2xl font-bold text-emerald-400">{Number(existingVote[2]).toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <>
              {/* User Reputation Display */}
              <div className="mb-4 p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Your Reputation</span>
                  <span className={`text-xs font-semibold ${repColor}`}>{repLevel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-white">{(multiplierValue * 100).toFixed(0)}</div>
                    <div className="text-xs text-slate-500">Base Score</div>
                  </div>
                  <div className="w-px h-10 bg-slate-700" />
                  <div className="flex-1 text-right">
                    <div className="text-2xl font-bold text-amber-400">{multiplierValue.toFixed(2)}x</div>
                    <div className="text-xs text-slate-500">Multiplier</div>
                  </div>
                </div>
              </div>

              {/* Voting Method Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400 font-medium">Voting Method</label>
                  <button
                    onClick={() => setShowMethodInfo(!showMethodInfo)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setVotingMethod('simple')}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      votingMethod === 'simple'
                        ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                        : 'bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Scale className="w-4 h-4 mx-auto mb-1" />
                    Simple
                  </button>
                  <button
                    onClick={() => setVotingMethod('quadratic')}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      votingMethod === 'quadratic'
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4 mx-auto mb-1" />
                    Quadratic
                  </button>
                  <button
                    onClick={() => setVotingMethod('weighted')}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      votingMethod === 'weighted'
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                        : 'bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mx-auto mb-1" />
                    Weighted
                  </button>
                </div>

                {showMethodInfo && (
                  <div className="mt-3 p-3 bg-slate-800/60 border border-slate-700/40 rounded-lg text-xs text-slate-300 space-y-2">
                    <div>
                      <span className="font-semibold text-blue-400">Simple:</span> credits × reputation
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-400">Quadratic:</span> √credits × reputation (Sybil-resistant)
                    </div>
                    <div>
                      <span className="font-semibold text-purple-400">Weighted:</span> credits × reputation × 1.5
                    </div>
                  </div>
                )}
              </div>

              {/* Market Type Dropdown */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-2 block">Market</label>
                <select 
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {options.map((option, idx) => (
                    <option key={idx} value={idx}>
                      {option} {optionPercentages[idx]?.toFixed(0)}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Outcome Selection */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 font-semibold">
                  Yes {optionPercentages[selectedOption]?.toFixed(0) || 50}¢
                </button>
                <button className="px-4 py-3 bg-slate-800/40 border border-slate-700/40 rounded-lg text-slate-400 font-semibold">
                  No {(100 - (optionPercentages[selectedOption] || 50)).toFixed(0)}¢
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-2 block">Amount (REP Tokens)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-emerald-400 font-semibold">REP</span>
                  <input
                    type="number"
                    value={creditsSpent}
                    onChange={(e) => setCreditsSpent(Number(e.target.value))}
                    className="w-full pl-16 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 50, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCreditsSpent(val)}
                      className="px-3 py-1.5 bg-slate-800/40 border border-slate-700/40 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      {val} REP
                    </button>
                  ))}
                  <button
                    onClick={() => setCreditsSpent(100)}
                    className="px-3 py-1.5 bg-slate-800/40 border border-slate-700/40 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Token Faucet */}
              <div className="mb-4">
                <TokenFaucet />
              </div>

              {/* Approval Button */}
              {tokenBalance && tokenAllowance !== undefined && tokenAllowance < parseUnits(creditsSpent.toString(), 18) && (
                <button
                  onClick={handleApprove}
                  disabled={isPending || isConfirming}
                  className="w-full py-3 mb-4 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  {isPending || isConfirming ? '🔐 Approving...' : `Approve ${creditsSpent} REP Tokens`}
                </button>
              )}

              {/* Vote Weight Preview */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Calculated Vote Weight</span>
                  <span className="text-amber-400 font-medium">{multiplierValue.toFixed(2)}x rep</span>
                </div>
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {weightedVotes.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {votingMethod === 'simple' && `${creditsSpent} × ${multiplierValue.toFixed(2)} = ${weightedVotes.toFixed(2)}`}
                  {votingMethod === 'quadratic' && `√${creditsSpent} × ${multiplierValue.toFixed(2)} = ${weightedVotes.toFixed(2)}`}
                  {votingMethod === 'weighted' && `${creditsSpent} × ${multiplierValue.toFixed(2)} × 1.5 = ${weightedVotes.toFixed(2)}`}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Impact on {options[selectedOption]}</span>
                  <span className="text-emerald-400 font-semibold">
                    +{((weightedVotes / (totalVotes + weightedVotes)) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Trade Button */}
              <button
                onClick={handleVote}
                disabled={!isConnected || isPending || isConfirming}
                className={`w-full py-3.5 rounded-lg font-bold text-base transition-all ${
                  !isConnected
                    ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30'
                }`}
              >
                {!isConnected
                  ? 'Connect Wallet'
                  : isPending
                  ? '🔐 Confirming...'
                  : isConfirming
                  ? '⏳ Voting...'
                  : isSuccess
                  ? '✅ Done'
                  : 'Place Vote'}
              </button>

              <p className="text-xs text-slate-500 text-center mt-3">
                By voting, you agree to the Terms of Use
              </p>
            </>
          )}
        </div>

        {/* Related Markets */}
        {!hasVoted && (
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Related Markets
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <p>More markets coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

