import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, POLL_ABI, MOCK_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { calculateVoteWeight } from '@/lib/calculations';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';

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

  // Write contract function
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  // Separate hook for approvals
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Refetch allowance when approval is successful
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success('✅ Token approval successful!');
      setTimeout(() => refetchAllowance(), 1000);
    }
  }, [isApproveSuccess, refetchAllowance]);



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

    // Convert credits to token amount
    const tokenAmount = parseUnits(creditsSpent.toString(), 18);

    // Check if user has enough tokens
    if (!tokenBalance || tokenBalance < tokenAmount) {
      toast.error('Insufficient REP tokens. Get free tokens from the faucet!');
      return;
    }

    // Check if approval is needed
    if (!tokenAllowance || tokenAllowance < tokenAmount) {
      toast.error('Please approve REP tokens first using the Approve button');
      return;
    }

    try {
      console.log('📝 Submitting vote:', {
        poll: pollAddress,
        option: selectedOption,
        credits: creditsSpent,
        expectedWeight: weightedVotes.toFixed(2)
      });
      
      // Convert credits to token amount (1 credit = 1 token = 1e18 wei)
      const tokenAmount = parseUnits(creditsSpent.toString(), 18);
      // Use quadratic voting method by default (0=QUADRATIC, 1=SIMPLE, 2=WEIGHTED)
      const votingMethod = 0;
      
      writeContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: 'vote',
        args: [BigInt(selectedOption), tokenAmount, votingMethod],
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

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    const tokenAmount = parseUnits(creditsSpent.toString(), 18);

    try {
      writeApprove({
        address: MOCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [pollAddress, tokenAmount],
        gas: 50000n,
      });
      toast.info('Approval transaction submitted...');
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.shortMessage || error.message || 'Failed to approve tokens');
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
      <div className="sticky top-24 bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
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
      </div>
    );
  }

  return (
    <div className="sticky top-24 bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🗳️ Place Your Bet
      </h2>

      {/* Option Selection */}
      <div className="space-y-2 mb-5">
        <p className="text-slate-400 text-xs font-medium mb-2">Choose outcome</p>
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`w-full p-3 rounded-lg font-medium text-sm transition-all ${
              selectedOption === idx
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {selectedOption === idx && (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Credits Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-slate-400 text-xs font-medium">Vote Credits</label>
          <span className="text-lg font-bold text-white">{creditsSpent}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={creditsSpent}
          onChange={(e) => setCreditsSpent(Number(e.target.value))}
          className="w-full h-2 bg-slate-700/40 rounded-lg appearance-none cursor-pointer 
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-500 
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>Min</span>
          <span>Max</span>
        </div>
      </div>

      {/* Weight Preview */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs">Your Vote Weight</span>
          <span className="text-amber-400 text-xs font-medium">{multiplierValue.toFixed(1)}x rep</span>
        </div>
        <div className="text-2xl font-bold text-emerald-400">
          {weightedVotes.toFixed(2)}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono">
          √{creditsSpent} × {multiplierValue.toFixed(1)} = {weightedVotes.toFixed(2)}
        </div>
      </div>

      {/* Approve and Vote Buttons */}
      <div className="space-y-3">
        {/* Show approve button if not enough allowance */}
        {isConnected && tokenAllowance !== undefined && tokenAllowance < parseUnits(creditsSpent.toString(), 18) && (
          <button
            onClick={handleApprove}
            disabled={isApprovePending || isApproveConfirming}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20"
          >
            {isApprovePending
              ? '🔐 Confirm Approval...'
              : isApproveConfirming
              ? '⏳ Approving...'
              : '1️⃣ Approve REP Tokens'}
          </button>
        )}
        
        {/* Vote Button */}
        <button
          onClick={handleVote}
          disabled={selectedOption === null || isPending || isConfirming || !isConnected}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
            selectedOption === null || !isConnected
              ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/20'
          }`}
        >
          {!isConnected
            ? 'Connect Wallet'
            : isPending
            ? '🔐 Confirm...'
            : isConfirming
            ? '⏳ Voting...'
            : isSuccess
            ? '✅ Done'
            : tokenAllowance !== undefined && tokenAllowance < parseUnits(creditsSpent.toString(), 18)
            ? '2️⃣ Submit Vote (Approve First)'
            : 'Submit Vote'}
        </button>
      </div>

      {isSuccess && (
        <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center">
          <p className="text-emerald-400 text-sm">✅ Vote successfully recorded on-chain!</p>
        </div>
      )}
    </div>
  );
}
