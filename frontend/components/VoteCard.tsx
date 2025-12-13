'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, POLL_ABI } from '@/lib/contracts';
import { calculateVoteWeight } from '@/lib/calculations';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface VoteCardProps {
  pollAddress: `0x${string}`;
  options: string[];
  onVoteSuccess?: () => void;
}

export function VoteCard({ pollAddress, options, onVoteSuccess }: VoteCardProps) {
  const { address, isConnected, chain, chainId } = useAccount();
  const [creditsSpent, setCreditsSpent] = useState(9);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
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

  // Check if user already voted - with polling enabled
  const isZeroAddress = pollAddress === '0x0000000000000000000000000000000000000000';
  const { data: existingVote, refetch: refetchVote, queryKey: voteQueryKey } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'votes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && !isZeroAddress,
      refetchInterval: 5000, // Reduced frequency
      staleTime: 2000,
      gcTime: 10000,
    },
  });

  // Write contract function
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();



  // Wait for transaction with polling
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });


  const hasVoted = existingVote && existingVote[3] > 0n; // Check timestamp

  // Log transaction state changes
  useEffect(() => {
    if (hash) {
      console.log('🔄 Transaction submitted:', hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isConfirming) {
      console.log('⏳ Waiting for transaction confirmation...', hash);
    }
  }, [isConfirming, hash]);

  useEffect(() => {
    if (isSuccess && hash) {
      console.log('✅ Vote Transaction Confirmed!', {
        hash,
        timestamp: new Date().toISOString()
      });
      
      // Wait a bit for the blockchain state to settle, then invalidate
      setTimeout(() => {
        console.log('🔄 Invalidating queries for poll:', pollAddress);
        
        // Invalidate ALL queries for this poll to force fresh data
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            // Invalidate any query that involves this poll address
            return JSON.stringify(query.queryKey).includes(pollAddress.toLowerCase());
          }
      });
      
      // Also manually refetch vote data
      setTimeout(() => {
        console.log('🔄 Refetching vote data...');
        refetchVote();
      }, 500);
      
      // Call the success callback if provided (to trigger ResultsChart refetch)
      if (onVoteSuccess) {
        console.log('📢 Calling onVoteSuccess callback...');
        setTimeout(() => {
          onVoteSuccess();
        }, 1000);
      }
      
      // Show success toast
      toast.success('✅ Vote successfully recorded on-chain!');
      }, 2000);
    }
  }, [isSuccess, refetchVote, onVoteSuccess, hash, queryClient, pollAddress]);

  // Debug logging for vote state
  useEffect(() => {
    if (isConnected && address) {
      console.log('🗳️ VoteCard State:', {
        pollAddress,
        userAddress: address,
        hasVoted,
        existingVote: existingVote ? {
          option: existingVote[0].toString(),
          creditsSpent: existingVote[1].toString(),
          weightedVotes: Number(existingVote[2]).toFixed(2),
          timestamp: new Date(Number(existingVote[3]) * 1000).toLocaleString()
        } : 'No vote yet',
        isPending,
        isConfirming,
        isSuccess
      });
    }
}, [existingVote, hasVoted, isPending, isConfirming, isSuccess, isConnected, address, pollAddress]);

  const handleVote = async () => {

    // Prevent voting on zero address
    if (pollAddress === '0x0000000000000000000000000000000000000000') {
      toast.error('⚠️ Please select a poll from the list first');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (selectedOption === null) {
      toast.error('Please select an option');
      return;
    }

    try {
      console.log('📝 Submitting vote:', {
        poll: pollAddress,
        option: selectedOption,
        credits: creditsSpent,
        expectedWeight: weightedVotes.toFixed(2)
      });
      
      
      writeContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: 'vote',
        args: [BigInt(selectedOption), BigInt(creditsSpent)],
      });
      
      toast.info('Transaction submitted - waiting for confirmation...');
    } catch (error: any) {
      console.error('❌ Vote error:', error);
      
      // Provide helpful error messages
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('failed to fetch') || errorMsg.includes('fetch')) {
        toast.error('⚠️ Network Error: Unable to reach blockchain RPC. Please check your connection and try again.');
      } else if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
        toast.error('Transaction cancelled by user');
      } else {
        toast.error(error.shortMessage || error.message || 'Failed to cast vote');
      }
    }
  };

  // Calculate vote weight preview
  const weightedVotes = multiplier
    ? calculateVoteWeight(creditsSpent, multiplier)
    : 0;
  
  const multiplierValue = multiplier ? (Number(multiplier) / 1e18) : 0;
  const sqrtCredits = Math.sqrt(creditsSpent);

  if (hasVoted) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Vote Cast!</h3>
          <p className="text-slate-400 mb-2">
            You voted for: <span className="text-emerald-400 font-semibold">{options[Number(existingVote[0])]}</span>
          </p>
          <div className="bg-slate-800/40 rounded-lg p-4 mt-4 border border-slate-700/50">
            <p className="text-slate-500 text-xs mb-1">Vote Weight</p>
            <p className="text-3xl font-bold text-emerald-400">{Number(existingVote[2]).toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
      <h2 className="text-2xl font-bold text-white mb-6">Cast Your Vote</h2>

      {/* Credits Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-slate-300 text-sm font-medium">Credits to Spend</label>
          <span className="text-2xl font-bold text-emerald-400">{creditsSpent}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={creditsSpent}
          onChange={(e) => setCreditsSpent(Number(e.target.value))}
          className="w-full h-2 bg-slate-700/40 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>1</span>
          <span>100</span>
        </div>
      </div>

      {/* Math Visualizer - Key Component */}
      <div className="bg-black/40 border border-slate-700/50 rounded-lg p-6 mb-8">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Math Equation</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">√</span>
              <span className="text-white font-bold">{creditsSpent}</span>
            </div>
            <span className="text-slate-600">×</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">{multiplierValue.toFixed(1)}x</span>
            </div>
            <span className="text-slate-600">=</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-lg">{weightedVotes.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-700/30 rounded p-2 border border-slate-600/50">
              <p className="text-slate-500">Credits</p>
              <p className="text-white font-semibold">{sqrtCredits.toFixed(2)}</p>
            </div>
            <div className="bg-amber-950/30 rounded p-2 border border-amber-600/50">
              <p className="text-amber-300">Multiplier</p>
              <p className="text-amber-400 font-semibold">{multiplierValue.toFixed(2)}x</p>
            </div>
            <div className="bg-emerald-950/30 rounded p-2 border border-emerald-600/50">
              <p className="text-emerald-300">Result</p>
              <p className="text-emerald-400 font-semibold">{weightedVotes.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Option Selection - Large Cards */}
      <div className="space-y-3 mb-6">
        <p className="text-slate-300 text-sm font-medium">Select an option:</p>
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`w-full p-4 rounded-lg font-semibold transition-all duration-200 ${
              selectedOption === idx
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {selectedOption === idx && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={selectedOption === null || isPending || isConfirming || !isConnected}
        className={`w-full py-3 rounded-lg font-bold text-base transition-all duration-200 ${
          selectedOption === null || !isConnected
            ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/30'
        }`}
      >
        {!isConnected
          ? 'Connect Wallet to Vote'
          : isPending
          ? 'Confirming in Wallet...'
          : isConfirming
          ? 'Voting...'
          : isSuccess
          ? 'Vote Cast! ✓'
          : `Cast Vote (${weightedVotes.toFixed(2)} weight)`}
      </button>

      {isSuccess && (
        <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center">
          <p className="text-emerald-400 text-sm">✅ Vote successfully recorded on-chain!</p>
        </div>
      )}
    </div>
  );
}
