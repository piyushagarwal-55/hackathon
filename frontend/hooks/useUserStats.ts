import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI } from '@/lib/contracts';
import { PersonalStats } from '@/lib/analytics';
import { useUserPositions } from './useUserPositions';
import { formatUnits } from 'viem';
import { getCategoryFromQuestion } from '@/lib/categories';

export function useUserStats() {
  const { address } = useAccount();
  const { positions, isLoading: positionsLoading } = useUserPositions();
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's reputation
  const { data: reputationData } = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'reputation',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 15000,
    },
  });

  useEffect(() => {
    if (!address || positionsLoading) {
      setIsLoading(true);
      return;
    }

    const calculateStats = () => {
      const totalVotes = positions.length;
      const completedPositions = positions.filter((p) => !p.isActive);
      const totalWins = completedPositions.filter((p) => p.isWinner).length;
      const totalLosses = completedPositions.length - totalWins;
      const winRate = completedPositions.length > 0 ? (totalWins / completedPositions.length) * 100 : 0;

      // Calculate P&L
      let totalProfitLoss = 0n;
      for (const position of completedPositions) {
        if (position.winnings !== undefined) {
          totalProfitLoss += position.winnings - position.betAmount;
        } else {
          totalProfitLoss -= position.betAmount;
        }
      }

      // Calculate average bet size
      const totalBet = positions.reduce((sum, p) => sum + p.betAmount, 0n);
      const averageBetSize = positions.length > 0 ? totalBet / BigInt(positions.length) : 0n;

      // Calculate votes by category
      const votesByCategory: Record<string, number> = {};
      for (const position of positions) {
        const category = position.category || 'other';
        votesByCategory[category] = (votesByCategory[category] || 0) + 1;
      }

      // Find best category (most votes)
      let bestCategory = 'other';
      let maxVotes = 0;
      for (const [category, votes] of Object.entries(votesByCategory)) {
        if (votes > maxVotes) {
          maxVotes = votes;
          bestCategory = category;
        }
      }

      // Calculate streak
      const sortedPositions = [...positions].sort((a, b) => b.timestamp - a.timestamp);
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const now = Date.now() / 1000; // Convert to seconds
      const oneDaySeconds = 24 * 60 * 60;

      // Current streak: consecutive days with votes
      for (let i = 0; i < sortedPositions.length; i++) {
        const daysDiff = Math.floor((now - sortedPositions[i].timestamp) / oneDaySeconds);
        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Longest streak
      for (let i = 0; i < sortedPositions.length; i++) {
        tempStreak++;
        if (
          i === sortedPositions.length - 1 ||
          Math.floor((sortedPositions[i].timestamp - sortedPositions[i + 1].timestamp) / oneDaySeconds) > 1
        ) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);

      // Reputation growth (simplified - would need historical data)
      const currentRep = reputationData ? Number(formatUnits(reputationData, 18)) * 100 : 0;
      const reputationGrowth = [
        { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, reputation: currentRep * 0.5 },
        { timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, reputation: currentRep * 0.75 },
        { timestamp: Date.now(), reputation: currentRep },
      ];

      // Accuracy over time (rolling average)
      const accuracyOverTime: { timestamp: number; accuracy: number }[] = [];
      const windowSize = 10;
      for (let i = windowSize - 1; i < completedPositions.length; i++) {
        const window = completedPositions.slice(i - windowSize + 1, i + 1);
        const wins = window.filter((p) => p.isWinner).length;
        const accuracy = (wins / windowSize) * 100;
        accuracyOverTime.push({
          timestamp: completedPositions[i].timestamp * 1000,
          accuracy,
        });
      }

      const personalStats: PersonalStats = {
        totalVotes,
        totalWins,
        totalLosses,
        winRate,
        totalProfitLoss,
        averageBetSize,
        bestCategory,
        currentStreak,
        longestStreak,
        reputationGrowth,
        votesByCategory,
        accuracyOverTime,
      };

      setStats(personalStats);
      setIsLoading(false);
    };

    calculateStats();
  }, [address, positions, positionsLoading, reputationData]);

  return { stats, isLoading };
}

