'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, POLL_ABI } from '@/lib/contracts';
import { calculateVoteWeight, formatNumber } from '@/lib/calculations';
import { toast } from 'sonner';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface PolymarketStyleVoteProps {
  pollAddress: `0x${string}`;
  options: string[];
  question: string;
  onVoteSuccess?: () => void;
}

export function PolymarketStyleVote({ pollAddress, options, question, onVoteSuccess }: PolymarketStyleVoteProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [creditsSpent, setCreditsSpent] = useState(10);
  const [selectedOption, setSelectedOption] = useState<number>(0); // Default to first option
  const [chartData, setChartData] = useState<any[]>([]);
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
        if (onVoteSuccess) onVoteSuccess();
        toast.success('✅ Vote successfully recorded!');
      }, 2000);
    }
  }, [isSuccess, refetchVote, onVoteSuccess, hash, queryClient, pollAddress]);

  const handleVote = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      writeContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: 'vote',
        args: [BigInt(selectedOption), BigInt(creditsSpent)],
      });
      toast.info('Transaction submitted...');
    } catch (error: any) {
      toast.error(error.shortMessage || error.message || 'Failed to cast vote');
    }
  };

  const weightedVotes = multiplier ? calculateVoteWeight(creditsSpent, multiplier) : 0;
  const multiplierValue = multiplier ? (Number(multiplier) / 1e18) : 1;

  const totalVotes = results ? results.reduce((sum, votes) => sum + Number(votes), 0) : 0;
  const optionPercentages = results ? results.map(votes => 
    totalVotes > 0 ? (Number(votes) / totalVotes) * 100 : 0
  ) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Chart and Stats */}
      <div className="lg:col-span-2 space-y-6">
        {/* Chart Area */}
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{question}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>${formatNumber(totalVotes * 100)} Vol.</span>
                <span>•</span>
                <span>{totalVoters?.toString() || '0'} voters</span>
              </div>
            </div>
          </div>

          {/* Mock Chart - Would be replaced with actual chart library */}
          <div className="bg-slate-950/50 rounded-lg p-6 mb-6" style={{ height: '300px' }}>
            <div className="flex items-end justify-around h-full gap-2">
              {optionPercentages.map((pct, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-slate-800 rounded-t relative" style={{ height: `${Math.max(pct * 3, 10)}px` }}>
                    <div 
                      className={`absolute bottom-0 left-0 right-0 rounded-t transition-all ${
                        idx === 0 ? 'bg-emerald-500' : 
                        idx === 1 ? 'bg-red-500' : 
                        'bg-amber-500'
                      }`}
                      style={{ height: `${Math.max(pct * 3, 10)}px` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 mt-2">{pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Percentages */}
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, idx) => {
              const percentage = optionPercentages[idx] || 0;
              const voteCount = results ? Number(results[idx]) : 0;
              const isLeading = voteCount === Math.max(...(results?.map(Number) || [0])) && voteCount > 0;

              return (
                <div key={idx} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{option}</span>
                      {isLeading && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs text-emerald-400 font-medium">
                          Leading
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</div>
                      <div className="text-xs text-emerald-400">↑ {percentage > 50 ? '+' : ''}{(percentage - 50).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">${formatNumber(voteCount * 100)} Vol.</div>
                </div>
              );
            })}
          </div>
        </div>
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
              {/* Buy/Sell Tabs */}
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 font-semibold">
                  Buy
                </button>
                <button className="flex-1 py-2 bg-slate-800/40 border border-slate-700/40 rounded-lg text-slate-400 font-semibold">
                  Sell
                </button>
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
                <label className="text-xs text-slate-400 mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400">$</span>
                  <input
                    type="number"
                    value={creditsSpent}
                    onChange={(e) => setCreditsSpent(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[1, 20, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCreditsSpent(val)}
                      className="px-3 py-1.5 bg-slate-800/40 border border-slate-700/40 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      +${val}
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

              {/* Vote Weight Preview */}
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Vote Weight</span>
                  <span className="text-amber-400 font-medium">{multiplierValue.toFixed(1)}x rep</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {weightedVotes.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  √{creditsSpent} × {multiplierValue.toFixed(1)} = {weightedVotes.toFixed(2)}
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

        {/* Related Markets - Optional */}
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Related Markets
          </h3>
          <div className="space-y-2 text-xs text-slate-400">
            <p>More markets coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

