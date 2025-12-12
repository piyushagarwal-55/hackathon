'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, POLL_ABI } from '@/lib/contracts';
import { calculateVoteWeight } from '@/lib/calculations';
import { toast } from 'sonner';

interface VoteCardProps {
  pollAddress: `0x${string}`;
  options: string[];
}

export function VoteCard({ pollAddress, options }: VoteCardProps) {
  const { address, isConnected } = useAccount();
  const [creditsSpent, setCreditsSpent] = useState(9);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
  const { data: existingVote } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'votes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Write contract function
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const hasVoted = existingVote && existingVote[3] > 0n; // Check timestamp

  const handleVote = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (selectedOption === null) {
      toast.error('Please select an option');
      return;
    }

    try {
      writeContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: 'vote',
        args: [BigInt(selectedOption), BigInt(creditsSpent)],
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to cast vote');
    }
  };

  // Calculate vote weight preview
  const weightedVotes = multiplier
    ? calculateVoteWeight(creditsSpent, multiplier)
    : 0;

  if (hasVoted) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-white mb-2">Vote Cast!</h3>
          <p className="text-gray-400">
            You voted for: <span className="text-white font-semibold">{options[Number(existingVote[0])]}</span>
          </p>
          <p className="text-gray-400 mt-2">
            Your vote weight: <span className="text-indigo-400 font-bold">{(Number(existingVote[2]) / 1e18).toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Cast Your Vote</h2>

      {/* Credits Slider */}
      <div className="mb-8">
        <label className="block text-gray-300 mb-3 text-sm font-medium">
          Credits to Spend: {creditsSpent}
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={creditsSpent}
          onChange={(e) => setCreditsSpent(Number(e.target.value))}
          className="w-full h-3 bg-indigo-700/30 rounded-lg appearance-none cursor-pointer 
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 
                   [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-indigo-500 
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-indigo-500/50"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 credit</span>
          <span>100 credits</span>
        </div>
      </div>

      {/* Vote Weight Preview */}
      <div className="bg-indigo-600/20 rounded-xl p-4 mb-6 border border-indigo-500/30">
        <p className="text-gray-300 text-sm mb-1">Your Vote Weight Preview</p>
        <p className="text-4xl font-bold text-green-400">{weightedVotes.toFixed(2)}</p>
        <p className="text-gray-400 text-xs mt-2">
          √{creditsSpent} × {multiplier ? (Number(multiplier) / 1e18).toFixed(1) : '?'}x = {weightedVotes.toFixed(2)} votes
        </p>
      </div>

      {/* Option Buttons */}
      <div className="space-y-3 mb-6">
        <p className="text-gray-300 text-sm font-medium mb-3">Select an option:</p>
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${
              selectedOption === idx
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-[1.02]'
                : 'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {selectedOption === idx && <span className="text-2xl">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={selectedOption === null || isPending || isConfirming || !isConnected}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          selectedOption === null || !isConnected
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50'
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
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
          <p className="text-green-400 text-sm">✅ Vote successfully recorded on-chain!</p>
        </div>
      )}
    </div>
  );
}
