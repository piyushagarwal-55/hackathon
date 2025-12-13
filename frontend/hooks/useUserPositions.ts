import { useEffect, useState } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI, POLL_ABI } from '@/lib/contracts';
import { Position } from '@/lib/pnl';
import { getCategoryFromQuestion } from '@/lib/categories';

export function useUserPositions() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get all polls
  const { data: recentPolls } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: 'getRecentPolls',
    args: [50n], // Get last 50 polls
    query: {
      refetchInterval: 15000,
    },
  });

  useEffect(() => {
    if (!address || !recentPolls || !publicClient) {
      setIsLoading(false);
      return;
    }

    const fetchPositions = async () => {
      setIsLoading(true);
      const userPositions: Position[] = [];

      try {
        // Fetch vote data for each poll
        for (const pollAddress of recentPolls) {
          try {
            // Check if user has voted in this poll
            const voteData = await publicClient.readContract({
              address: pollAddress as `0x${string}`,
              abi: POLL_ABI,
              functionName: 'votes',
              args: [address],
            });

            // If creditsSpent > 0, user has voted
            if (voteData && voteData[1] > 0n) {
              // Fetch poll details
              const [question, isActive, endTime, betAmount, hasClaimed, winner] = await Promise.all([
                publicClient.readContract({
                  address: pollAddress as `0x${string}`,
                  abi: POLL_ABI,
                  functionName: 'question',
                }),
                publicClient.readContract({
                  address: pollAddress as `0x${string}`,
                  abi: POLL_ABI,
                  functionName: 'isActive',
                }),
                publicClient.readContract({
                  address: pollAddress as `0x${string}`,
                  abi: POLL_ABI,
                  functionName: 'endTime',
                }),
                publicClient.readContract({
                  address: pollAddress as `0x${string}`,
                  abi: POLL_ABI,
                  functionName: 'userBets',
                  args: [address],
                }),
                publicClient.readContract({
                  address: pollAddress as `0x${string}`,
                  abi: POLL_ABI,
                  functionName: 'hasClaimed',
                  args: [address],
                }),
                publicClient.readContract({
                  address: pollAddress as `0x${string}`,
                  abi: POLL_ABI,
                  functionName: 'getWinner',
                }).catch(() => [0n, 0n]), // Returns [0,0] if market still active
              ]);

              const selectedOption = Number(voteData[0]);
              const winningOption = Number(winner[0]);
              const isWinner = !isActive && selectedOption === winningOption;

              // Calculate winnings if market ended and user won
              let winnings = 0n;
              if (!isActive && isWinner && !hasClaimed) {
                // Simplified: winnings would be calculated based on pool distribution
                // For now, we'll estimate based on bet amount
                winnings = betAmount * 2n; // Rough estimate
              } else if (hasClaimed) {
                winnings = betAmount * 2n; // They already claimed
              }

              const category = getCategoryFromQuestion(question as string);

              const position: Position = {
                marketAddress: pollAddress as string,
                marketQuestion: question as string,
                selectedOption,
                betAmount: betAmount,
                voteWeight: voteData[2],
                timestamp: Number(voteData[3]),
                isActive: isActive as boolean,
                isWinner: !isActive ? isWinner : undefined,
                winnings: !isActive ? winnings : undefined,
                category,
              };

              userPositions.push(position);
            }
          } catch (error) {
            console.error(`Error fetching position for poll ${pollAddress}:`, error);
          }
        }

        // Sort by timestamp (most recent first)
        userPositions.sort((a, b) => b.timestamp - a.timestamp);
        setPositions(userPositions);
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [address, recentPolls, publicClient]);

  return { positions, isLoading };
}

