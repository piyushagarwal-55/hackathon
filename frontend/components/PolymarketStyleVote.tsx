'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, POLL_ABI, MOCK_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { calculateVoteWeight, formatNumber, getReputationLevel } from '@/lib/calculations';
import { toast } from 'sonner';
import { CheckCircle2, TrendingUp, Info, Zap, Scale, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { MarketChart } from './MarketChart';
import { TokenFaucet } from './TokenFaucet';
import { ClaimWinnings } from './ClaimWinnings';
import { ShareButton } from './ShareButton';
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

  // Check if address is zero address (needs to be declared first)
  const isZeroAddress = pollAddress === '0x0000000000000000000000000000000000000000';

  // Write contracts - MUST be declared before read contracts that depend on their state
  const { writeContract: writeVote, data: voteHash, isPending: isVotePending } = useWriteContract();
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  
  const { isLoading: isVoteConfirming, isSuccess: isVoteSuccess } = useWaitForTransactionReceipt({ hash: voteHash });
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

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
      refetchInterval: isApproveSuccess ? 2000 : 10000, // Faster refetch after approval
      staleTime: 0, // Always refetch to get latest allowance
    },
  });
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

  const hasVoted = existingVote && existingVote[3] > 0n;

  // Log vote hash when transaction is submitted
  useEffect(() => {
    if (voteHash) {
      console.log('📤 Vote transaction hash received:', voteHash);
      console.log('⏳ Waiting for confirmation...');
      console.log('View on Arbiscan: https://sepolia.arbiscan.io/tx/' + voteHash);
    }
  }, [voteHash]);

  // Log approval hash when transaction is submitted  
  useEffect(() => {
    if (approveHash) {
      console.log('📤 Approval transaction hash received:', approveHash);
      console.log('⏳ Waiting for confirmation...');
      console.log('View on Arbiscan: https://sepolia.arbiscan.io/tx/' + approveHash);
    }
  }, [approveHash]);

  // Handle vote success with celebration
  useEffect(() => {
    if (isVoteSuccess && voteHash) {
      console.log('🎉 Vote successful!');
      console.log('Transaction hash:', voteHash);
      console.log('View on Arbiscan: https://sepolia.arbiscan.io/tx/' + voteHash);
      
      // Show confetti effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Create confetti effect using DOM elements
        const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];
        for (let i = 0; i < 5; i++) {
          const confetti = document.createElement('div');
          confetti.style.position = 'fixed';
          confetti.style.width = '10px';
          confetti.style.height = '10px';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.left = `${randomInRange(0, 100)}%`;
          confetti.style.top = `${randomInRange(0, 100)}%`;
          confetti.style.borderRadius = '50%';
          confetti.style.pointerEvents = 'none';
          confetti.style.zIndex = '9999';
          confetti.style.animation = 'confettiFall 1s ease-out forwards';
          document.body.appendChild(confetti);
          setTimeout(() => confetti.remove(), 1000);
        }
      }, 250);

      setTimeout(() => {
        queryClient.invalidateQueries({ 
          predicate: (query) => JSON.stringify(query.queryKey).includes(pollAddress.toLowerCase())
        });
        refetchVote();
        refetchBalance();
        refetchAllowance();
        if (onVoteSuccess) onVoteSuccess();
        toast.success('🎉 Vote successfully recorded!', {
          description: 'Your reputation has been updated',
          duration: 5000,
        });
      }, 2000);
    }
  }, [isVoteSuccess, refetchVote, refetchBalance, refetchAllowance, onVoteSuccess, voteHash, queryClient, pollAddress]);

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && approveHash) {
      console.log('✅ Approval confirmed! Hash:', approveHash);
      console.log('View on Arbiscan: https://sepolia.arbiscan.io/tx/' + approveHash);
      console.log('Refetching allowance...');
      
      // Immediate refetch
      refetchAllowance();
      
      // Multiple refetches to ensure blockchain state is updated
      const refetchIntervals = [1000, 2000, 3000];
      refetchIntervals.forEach((delay) => {
        setTimeout(() => {
          console.log(`Refetching allowance after ${delay}ms...`);
          refetchAllowance();
        }, delay);
      });
      
      // Show success message after final refetch
      setTimeout(() => {
        toast.success('✅ Tokens approved! You can now vote.', {
          description: 'Wait a moment for the blockchain to update',
        });
      }, 3500);
    }
  }, [isApproveSuccess, approveHash, refetchAllowance]);

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    // Validate input
    if (creditsSpent <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (creditsSpent > 100) {
      toast.error('Maximum 100 REP tokens per vote');
      return;
    }

    const tokenAmount = parseUnits(creditsSpent.toString(), 18);
    // Add 10% buffer to approval to prevent edge case failures
    const approvalAmount = (tokenAmount * 110n) / 100n;

    console.log('=== APPROVAL DEBUG INFO ===');
    console.log('Token Address:', MOCK_TOKEN_ADDRESS);
    console.log('Poll Address (spender):', pollAddress);
    console.log('Token Amount:', tokenAmount.toString());
    console.log('Approval Amount (with buffer):', approvalAmount.toString());
    console.log('Token Amount (formatted):', formatUnits(tokenAmount, 18));
    console.log('Approval Amount (formatted):', formatUnits(approvalAmount, 18));
    console.log('Current Allowance:', tokenAllowance ? formatUnits(tokenAllowance, 18) : '0');
    console.log('==========================');

    try {
      writeApprove({
        address: MOCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [pollAddress, approvalAmount],
        gas: 50000n, // Set gas limit for approval (typically 46k-48k)
      });
      toast.info('Approval transaction submitted...');
    } catch (error: any) {
      console.error('=== APPROVAL ERROR ===');
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      console.error('======================');
      toast.error(error.shortMessage || error.message || 'Failed to approve tokens');
    }
  };

  const handleVote = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    // Validate input
    if (creditsSpent <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (creditsSpent > 100) {
      toast.error('Maximum 100 REP tokens per vote');
      return;
    }

    const tokenAmount = parseUnits(creditsSpent.toString(), 18);

    // Check if user has enough tokens (FIXED: handle undefined)
    if (!tokenBalance || tokenBalance < tokenAmount) {
      toast.error('Insufficient REP tokens. Get free tokens from the faucet!');
      return;
    }

    // Refetch vote status to ensure user hasn't already voted
    console.log('Refetching vote status...');
    const { data: freshVoteData } = await refetchVote();
    const currentVoteData = freshVoteData ?? existingVote;
    const hasAlreadyVoted = currentVoteData && currentVoteData[3] > 0n;
    
    if (hasAlreadyVoted) {
      toast.error('⛔ You have already voted on this poll');
      return;
    }
    
    // Refetch allowance immediately before voting to ensure we have fresh data
    console.log('Refetching allowance before vote...');
    const { data: freshAllowance } = await refetchAllowance();
    const currentAllowance = freshAllowance ?? tokenAllowance;
    
    console.log('Current allowance after refetch:', currentAllowance ? formatUnits(currentAllowance, 18) : '0');

    // Check if approval is needed
    if (!currentAllowance || currentAllowance < tokenAmount) {
      toast.error(`Please approve REP tokens first. Current allowance: ${currentAllowance ? formatUnits(currentAllowance, 18) : '0'}`);
      return;
    }

    // Convert voting method to uint8 for contract
    const votingMethodNumber = votingMethod === 'simple' ? 1 : votingMethod === 'quadratic' ? 0 : 2;

    console.log('=== VOTE DEBUG INFO ===');
    console.log('Poll Address:', pollAddress);
    console.log('Selected Option:', selectedOption);
    console.log('Token Amount:', tokenAmount.toString());
    console.log('Token Amount (formatted):', formatUnits(tokenAmount, 18));
    console.log('Voting Method:', votingMethod, '-> Number:', votingMethodNumber);
    console.log('User Balance:', tokenBalance ? formatUnits(tokenBalance, 18) : '0');
    console.log('User Allowance:', tokenAllowance ? formatUnits(tokenAllowance, 18) : '0');
    console.log('Credits Spent:', creditsSpent);
    console.log('Has Voted:', hasVoted);
    console.log('======================');

    try {
      // Re-validate critical state immediately before transaction
      console.log('🔍 Re-validating state before vote submission...');
      
      // Force a small delay to ensure previous transactions are settled
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 1. Check if user has already voted (race condition check)
      const currentVoteStatus = await publicClient?.readContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: 'votes',
        args: [address],
      });
      
      if (currentVoteStatus && currentVoteStatus[3] > 0n) {
        toast.error('✋ You have already voted on this poll');
        console.error('Vote check failed: User has already voted');
        refetchVote();
        return;
      }
      
      // 2. Check current allowance (race condition check)
      const currentAllowance = await publicClient?.readContract({
        address: MOCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, pollAddress],
      });
      
      console.log('Current allowance (final check):', currentAllowance?.toString());
      
      if (!currentAllowance || currentAllowance < tokenAmount) {
        toast.error('❌ Insufficient allowance. Please approve again.');
        console.error('Allowance check failed:', currentAllowance?.toString(), 'needed:', tokenAmount.toString());
        refetchAllowance();
        return;
      }
      
      // 3. Check poll is still active
      const pollActive = await publicClient?.readContract({
        address: pollAddress,
        abi: POLL_ABI,
        functionName: 'isActive',
      });
      
      if (!pollActive) {
        toast.error('⏱️ This poll has ended');
        console.error('Poll is no longer active');
        return;
      }
      
      console.log('✅ All pre-flight checks passed');
      
      // 4. Simulate the contract call to catch any reverts
      try {
        console.log('🧪 Simulating contract call...');
        await publicClient?.simulateContract({
          address: pollAddress,
          abi: POLL_ABI,
          functionName: 'vote',
          args: [BigInt(selectedOption), tokenAmount, votingMethodNumber],
          account: address,
        });
        console.log('✅ Simulation successful');
      } catch (simError: any) {
        console.error('=== SIMULATION FAILED ===');
        console.error('Simulation error:', simError);
        console.error('Error message:', simError.message);
        console.error('Error cause:', simError.cause);
        
        // Extract detailed error
        let errorMsg = 'Transaction will fail';
        if (simError.cause?.reason) {
          errorMsg = simError.cause.reason;
        } else if (simError.message) {
          if (simError.message.includes('AlreadyVoted')) {
            errorMsg = 'You have already voted';
          } else if (simError.message.includes('PollClosed')) {
            errorMsg = 'Poll has ended';
          } else if (simError.message.includes('InvalidOption')) {
            errorMsg = 'Invalid option';
          } else if (simError.message.includes('transfer')) {
            errorMsg = 'Token transfer will fail - check allowance';
          }
        }
        
        toast.error(`❌ ${errorMsg}`);
        console.error('=========================');
        
        // Refresh state since simulation failed
        refetchAllowance();
        refetchVote();
        return;
      }
      
      console.log('✅ Ready to submit transaction');
      
      // Fetch current gas prices from network
      let maxFeePerGas: bigint | undefined;
      let maxPriorityFeePerGas: bigint | undefined;
      
      try {
        const feeData = await publicClient?.estimateFeesPerGas();
        if (feeData) {
          maxFeePerGas = feeData.maxFeePerGas;
          maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
          console.log('📊 Gas prices:', maxFeePerGas?.toString(), maxPriorityFeePerGas?.toString());
        }
      } catch (e) {
        console.warn('⚠️ Could not fetch gas prices');
      }
      
      // Try to estimate gas first to catch reverts early
      let gasEstimate = 300000n;
      if (publicClient) {
        try {
          console.log('Estimating gas...');
          const estimate = await publicClient.estimateContractGas({
            address: pollAddress,
            abi: POLL_ABI,
            functionName: 'vote',
            args: [BigInt(selectedOption), tokenAmount, votingMethodNumber],
            account: address,
          });
          // Add 30% buffer to gas estimate for safety
          gasEstimate = (estimate * 130n) / 100n;
          console.log('Gas estimate:', estimate.toString(), '→ with buffer:', gasEstimate.toString());
        } catch (gasError: any) {
          console.error('=== GAS ESTIMATION FAILED ===');
          console.error('Full error:', gasError);
          console.error('Error message:', gasError.message);
          console.error('Error details:', gasError.details);
          console.error('Error data:', gasError.data);
          
          // Try to extract the actual revert reason from error data
          if (gasError.data) {
            console.error('Raw error data:', gasError.data);
          }
          if (gasError.cause) {
            console.error('Error cause:', gasError.cause);
          }
          if (gasError.metaMessages) {
            console.error('Meta messages:', gasError.metaMessages);
          }
          
          // Try to extract revert reason
          let revertReason = 'Unknown error';
          if (gasError.message) {
            if (gasError.message.includes('PollClosed')) {
              revertReason = 'Poll has ended';
            } else if (gasError.message.includes('AlreadyVoted')) {
              revertReason = 'You have already voted';
            } else if (gasError.message.includes('InvalidOption')) {
              revertReason = 'Invalid option selected';
            } else if (gasError.message.includes('InvalidCredits')) {
              revertReason = 'Invalid token amount';
            } else if (gasError.message.includes('insufficient allowance')) {
              revertReason = 'Insufficient token allowance - try approving again';
            } else if (gasError.message.includes('insufficient funds')) {
              revertReason = 'Insufficient token balance';
            } else {
              revertReason = gasError.message;
            }
          }
          
          toast.error(`Transaction will fail: ${revertReason}`);
          console.error('============================');
          return;
        }
      }

      console.log('Submitting vote transaction with gas:', gasEstimate.toString());
      
      // Add a small delay to ensure state is propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        writeVote({
          address: pollAddress,
          abi: POLL_ABI,
          functionName: 'vote',
          args: [BigInt(selectedOption), tokenAmount, votingMethodNumber],
          gas: gasEstimate,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
        
        console.log('📝 Transaction submitted to wallet');
        toast.info('📝 Confirm the VOTE transaction in MetaMask...', {
          description: 'This is separate from the approval',
        });
      } catch (submitError: any) {
        console.error('=== METAMASK SUBMISSION ERROR ===');
        console.error('This error occurs when sending to MetaMask, not from the contract');
        console.error('Full error:', submitError);
        console.error('Error message:', submitError.message);
        console.error('Error code:', submitError.code);
        console.error('Error data:', submitError.data);
        console.error('================================');
        
        // Check if it's a MetaMask user rejection
        if (submitError.code === 4001 || submitError.message?.includes('User rejected')) {
          toast.error('❌ Transaction rejected in MetaMask');
          return;
        }
        
        // Check if it's an RPC error
        if (submitError.code === -32603 || submitError.message?.includes('Internal JSON-RPC')) {
          console.error('🔧 TROUBLESHOOTING STEPS:');
          console.error('1. Wait 10-30 seconds and try voting again');
          console.error('2. MetaMask → Settings → Advanced → Reset Account');
          console.error('3. Switch to different network, then switch back');
          console.error('4. Close and reopen MetaMask');
          console.error('5. Try increasing gas limit manually in MetaMask');
          console.error('6. Check if Arbitrum Sepolia network is working: https://sepolia.arbiscan.io/');
          console.error('');
          console.error('⚠️ This is a MetaMask/RPC error, NOT a contract error');
          console.error('The simulation passed, so the contract would accept your vote');
          console.error('The problem is with MetaMask sending the transaction to the network');
          
          toast.error('⚠️ MetaMask RPC Error', {
            description: 'Try: 1) Wait 30sec & retry 2) Reset MetaMask account 3) Switch networks',
            duration: 15000,
          });
          
          // Auto-refresh state after 2 seconds
          setTimeout(() => {
            console.log('Auto-refreshing state after RPC error...');
            refetchBalance();
            refetchAllowance();
            refetchVote();
          }, 2000);
          
          return;
        }
        
        throw submitError;
      }
    } catch (error: any) {
      console.error('=== VOTE ERROR ===');
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error shortMessage:', error.shortMessage);
      console.error('Error details:', error.details);
      console.error('Error code:', error.code);
      console.error('Error data:', error.data);
      console.error('Error cause:', error.cause);
      console.error('Error metaMessages:', error.metaMessages);
      console.error('Error name:', error.name);
      console.error('Error walk:', error.walk ? error.walk() : 'N/A');
      console.error('==================');
      
      // Parse specific error messages
      const errorMessage = error.shortMessage || error.message || '';
      if (errorMessage.includes('PollClosed')) {
        toast.error('⏱️ This poll has ended');
      } else if (errorMessage.includes('AlreadyVoted')) {
        toast.error('✋ You have already voted on this poll');
      } else if (errorMessage.includes('InvalidOption')) {
        toast.error('❌ Invalid option selected');
      } else if (errorMessage.includes('InvalidCredits')) {
        toast.error('❌ Invalid token amount');
      } else if (errorMessage.toLowerCase().includes('allowance') || errorMessage.includes('ERC20: insufficient allowance')) {
        toast.error('❌ Insufficient token allowance. Please approve again.');
        // Trigger allowance refetch
        setTimeout(() => refetchAllowance(), 1000);
      } else if (errorMessage.includes('transfer') && errorMessage.includes('failed')) {
        toast.error('❌ Token transfer failed. Check your balance and allowance.');
        // Trigger balance and allowance refetch
        setTimeout(() => {
          refetchBalance();
          refetchAllowance();
        }, 1000);
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
        toast.error('❌ Transaction rejected');
      } else if (errorMessage.includes('nonce')) {
        toast.error('⚠️ Nonce error. Please try again.');
        // Refetch everything to reset state
        setTimeout(() => {
          refetchBalance();
          refetchAllowance();
          refetchVote();
        }, 1000);
      } else if (errorMessage.includes('Internal JSON-RPC')) {
        // Generic RPC error - need to investigate deeper
        toast.error('🔍 Transaction failed. Check console for details.');
        console.error('⚠️ Internal RPC error - possible causes:');
        console.error('1. Poll ended between checks');
        console.error('2. Already voted (race condition)');
        console.error('3. Insufficient allowance (stale data)');
        console.error('4. Network/RPC node issue');
        console.error('Recommend: Refresh page and try again');
        
        // Force full state refresh
        setTimeout(() => {
          refetchBalance();
          refetchAllowance();
          refetchVote();
        }, 1000);
      } else {
        toast.error('Failed to cast vote: ' + errorMessage);
      }
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

  // Get total bet amount (prize pool)
  const { data: totalBetAmount } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'totalBetAmount',
    query: { 
      enabled: !isZeroAddress,
      refetchInterval: 10000,
    },
  });

  // Get user's bet amount
  const { data: userBetAmount } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'userBets',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && !isZeroAddress,
      refetchInterval: 10000,
    },
  });

  const isEnded = pollEndTime ? BigInt(Date.now()) > pollEndTime * 1000n : false;
  const timeRemaining = pollEndTime ? Number(pollEndTime) - Math.floor(Date.now() / 1000) : 0;
  const daysLeft = Math.floor(timeRemaining / 86400);
  const hoursLeft = Math.floor((timeRemaining % 86400) / 3600);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-scale-in">
      {/* Left Column - Chart and Stats */}
      <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
        {/* Header */}
        <div className="bg-[#131a22] backdrop-blur-sm rounded-xl p-6 border border-slate-800/40">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl font-bold text-white flex-1">{question}</h1>
                <ShareButton
                  marketQuestion={question}
                  marketAddress={pollAddress}
                  currentOdds={optionPercentages.length >= 2 ? { yes: optionPercentages[0], no: optionPercentages[1] } : undefined}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Prize Pool:</span>
                  <span className="font-bold text-emerald-400">
                    {totalBetAmount ? `${parseFloat(formatUnits(totalBetAmount, 18)).toFixed(2)} REP` : '0 REP'}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Voters:</span>
                  <span className="font-bold text-white">{totalVoters?.toString() || '0'}</span>
                </div>
                {userBetAmount && userBetAmount > 0n && (
                  <>
                    <div className="w-px h-4 bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Your Bet:</span>
                      <span className="font-bold text-amber-400">
                        {formatUnits(userBetAmount, 18)} REP
                      </span>
                    </div>
                  </>
                )}
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
      <div className="space-y-4 order-1 lg:order-2">
        <div className="sticky top-24 bg-[#131a22] backdrop-blur-sm rounded-xl p-6 border border-slate-800/40">
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

              {/* Debug Info Panel - Remove after fixing */}
              <div className="mb-4 p-3 bg-slate-900/60 border border-slate-700/40 rounded-lg text-xs font-mono">
                <div className="text-slate-400 font-semibold mb-2">Debug Info:</div>
                <div className="space-y-1 text-slate-500">
                  <div>Balance: {tokenBalance ? formatUnits(tokenBalance, 18) : '0'} REP</div>
                  <div>Allowance: {tokenAllowance ? formatUnits(tokenAllowance, 18) : '0'} REP</div>
                  <div>Credits: {creditsSpent}</div>
                  <div>Amount: {parseUnits(creditsSpent.toString(), 18).toString()}</div>
                  <div>Has Voted: {hasVoted ? 'Yes' : 'No'}</div>
                  <div>Approval Status: {isApproveSuccess ? 'Success' : isApprovePending ? 'Pending' : isApproveConfirming ? 'Confirming' : 'Not Started'}</div>
                  <div>Vote Status: {isVoteSuccess ? 'Success' : isVotePending ? 'Pending' : isVoteConfirming ? 'Confirming' : 'Not Started'}</div>
                </div>
              </div>

              {/* Voting Method Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400 font-medium">Voting Method (Preview Only)</label>
                  <button
                    onClick={() => setShowMethodInfo(!showMethodInfo)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-amber-400/80 mb-2">
                  ⚠️ Contract uses quadratic voting. This selector is for weight preview only.
                </p>
                
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400">Amount (REP Tokens)</label>
                  {tokenBalance !== undefined && (
                    <span className={`text-xs font-medium ${
                      tokenBalance === 0n 
                        ? 'text-red-400' 
                        : parseFloat(formatUnits(tokenBalance, 18)) < creditsSpent
                        ? 'text-amber-400'
                        : 'text-slate-500'
                    }`}>
                      Balance: {parseFloat(formatUnits(tokenBalance, 18)).toFixed(2)} REP
                    </span>
                  )}
                </div>
                
                {/* Warning for zero balance */}
                {tokenBalance !== undefined && tokenBalance === 0n && (
                  <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-xs text-amber-400 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>You need REP tokens to vote. Click "Get 1000 Free REP" below!</span>
                    </p>
                  </div>
                )}
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-emerald-400 font-semibold">REP</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={creditsSpent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (val < 0) return;
                      if (val > 100) {
                        setCreditsSpent(100);
                        toast.warning('Maximum 100 REP per vote');
                        return;
                      }
                      setCreditsSpent(val);
                    }}
                    className="w-full pl-16 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 50, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCreditsSpent(val)}
                      className="px-3 py-1.5 bg-slate-800/40 border border-slate-700/40 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      {val} REP
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      if (tokenBalance) {
                        const maxAmount = Math.min(100, Math.floor(Number(formatUnits(tokenBalance, 18))));
                        setCreditsSpent(maxAmount);
                      } else {
                        setCreditsSpent(100);
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-800/40 border border-slate-700/40 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Token Faucet */}
              <div className="mb-4">
                <TokenFaucet />
              </div>

              {/* Two-Step Process Explanation */}
              {!hasVoted && (
                <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
                  <div className="font-semibold text-blue-400 mb-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Voting requires 2 separate MetaMask transactions:</span>
                  </div>
                  <div className="text-slate-300 space-y-1 ml-4.5">
                    <div className="flex items-center gap-2">
                      <span className={tokenAllowance && tokenAllowance >= parseUnits(creditsSpent.toString(), 18) ? 'text-emerald-400' : 'text-amber-400'}>
                        {tokenAllowance && tokenAllowance >= parseUnits(creditsSpent.toString(), 18) ? '✅' : '1️⃣'}
                      </span>
                      <span>Approve tokens (one-time permission)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">2️⃣</span>
                      <span>Cast vote (transfers tokens & records vote)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Debug: Refresh State Button */}
              <button
                onClick={() => {
                  console.log('🔄 Manual state refresh triggered');
                  refetchBalance();
                  refetchAllowance();
                  refetchVote();
                  toast.info('🔄 State refreshed');
                }}
                className="w-full py-2 mb-3 rounded-lg text-xs font-medium bg-slate-800/40 border border-slate-700/40 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>Refresh State (if errors occur)</span>
              </button>

              {/* Two-Step Process Explanation */}
              {!hasVoted && (
                <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
                  <div className="font-semibold text-blue-400 mb-1">ℹ️ Two-Step Process:</div>
                  <div className="text-slate-300 space-y-0.5">
                    <div>1️⃣ <span className={tokenAllowance && tokenAllowance >= parseUnits(creditsSpent.toString(), 18) ? 'text-emerald-400' : 'text-slate-400'}>Approve tokens</span> (give permission)</div>
                    <div>2️⃣ <span className="text-amber-400">Vote transaction</span> (actual vote)</div>
                  </div>
                </div>
              )}

              {/* Status Indicator */}
              <div className="mb-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Balance:</span>
                  <span className="text-emerald-400 font-mono">
                    {tokenBalance ? formatUnits(tokenBalance, 18) : '0'} REP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allowance:</span>
                  <span className={`font-mono ${tokenAllowance && tokenAllowance >= parseUnits(creditsSpent.toString(), 18) ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tokenAllowance ? formatUnits(tokenAllowance, 18) : '0'} REP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required:</span>
                  <span className="text-blue-400 font-mono">{creditsSpent} REP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Voted:</span>
                  <span className={hasVoted ? 'text-emerald-400' : 'text-slate-500'}>
                    {hasVoted ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
              </div>

              {/* Approval Button - Show when allowance is insufficient */}
              {!hasVoted && tokenAllowance !== undefined && tokenAllowance < parseUnits(creditsSpent.toString(), 18) && !isApproveSuccess && (
                <button
                  onClick={handleApprove}
                  disabled={isApprovePending || isApproveConfirming}
                  className="w-full py-3 mb-4 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 transition-all flex items-center justify-center gap-2"
                >
                  {isApprovePending || isApproveConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isApprovePending ? 'Confirm in wallet...' : 'Approving...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Step 1/2: Approve {creditsSpent} REP Tokens</span>
                    </>
                  )}
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
                    +{totalVotes + weightedVotes > 0 
                      ? ((weightedVotes / (totalVotes + weightedVotes)) * 100).toFixed(2)
                      : '0.00'}%
                  </span>
                </div>
              </div>

              {/* Vote Button */}
              <button
                onClick={handleVote}
                disabled={
                  !isConnected || 
                  isVotePending || 
                  isVoteConfirming ||
                  hasVoted ||
                  !tokenBalance ||
                  tokenBalance < parseUnits(creditsSpent.toString(), 18) ||
                  !tokenAllowance ||
                  tokenAllowance < parseUnits(creditsSpent.toString(), 18)
                }
                className={`w-full py-3.5 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  !isConnected || hasVoted || !tokenBalance || (tokenAllowance && tokenAllowance < parseUnits(creditsSpent.toString(), 18))
                    ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30'
                }`}
              >
                {!isConnected ? (
                  'Connect Wallet'
                ) : hasVoted ? (
                  '✅ Already Voted'
                ) : !tokenBalance || tokenBalance < parseUnits(creditsSpent.toString(), 18) ? (
                  '💰 Insufficient Balance'
                ) : !tokenAllowance || tokenAllowance < parseUnits(creditsSpent.toString(), 18) ? (
                  '🔒 Approve Tokens First'
                ) : isVotePending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Step 2/2: Confirm VOTE in MetaMask...</span>
                  </>
                ) : isVoteConfirming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Voting...</span>
                  </>
                ) : isVoteSuccess ? (
                  '✅ Vote Recorded'
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Step 2/2: Cast Vote ({creditsSpent} REP)</span>
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-3">
                By voting, you agree to the Terms of Use
              </p>
            </>
          )}
        </div>

        {/* Claim Winnings Section */}
        {hasVoted && isEnded && (
          <ClaimWinnings pollAddress={pollAddress} options={options} />
        )}

        {/* Related Markets */}
        {!hasVoted && !isEnded && (
          <div className="bg-[#131a22] backdrop-blur-sm rounded-xl p-5 border border-slate-800/40">
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

