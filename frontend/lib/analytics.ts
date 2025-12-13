export interface MarketStats {
  totalVolume: bigint;
  uniqueVoters: number;
  averageBetSize: bigint;
  priceHistory: { timestamp: number; yesPrice: number; noPrice: number }[];
  votingPatternsByHour: number[];
  topVotersByWeight: { address: string; weight: bigint }[];
}

export interface PersonalStats {
  totalVotes: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalProfitLoss: bigint;
  averageBetSize: bigint;
  bestCategory: string;
  currentStreak: number;
  longestStreak: number;
  reputationGrowth: { timestamp: number; reputation: number }[];
  votesByCategory: Record<string, number>;
  accuracyOverTime: { timestamp: number; accuracy: number }[];
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return (wins / total) * 100;
}

export function calculateAverageBetSize(totalBet: bigint, count: number): bigint {
  if (count === 0) return 0n;
  return totalBet / BigInt(count);
}

export function getBestCategory(votesByCategory: Record<string, number>): string {
  let maxCategory = 'other';
  let maxVotes = 0;
  
  for (const [category, votes] of Object.entries(votesByCategory)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      maxCategory = category;
    }
  }
  
  return maxCategory;
}

export function calculateStreak(votes: { timestamp: number; won: boolean }[]): { current: number; longest: number } {
  if (votes.length === 0) return { current: 0, longest: 0 };
  
  // Sort by timestamp descending
  const sorted = [...votes].sort((a, b) => b.timestamp - a.timestamp);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  // Calculate current streak (consecutive days with votes)
  for (let i = 0; i < sorted.length; i++) {
    const daysDiff = Math.floor((now - sorted[i].timestamp) / oneDayMs);
    if (daysDiff === i) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (let i = 0; i < sorted.length; i++) {
    tempStreak++;
    if (i === sorted.length - 1 || Math.floor((sorted[i].timestamp - sorted[i + 1].timestamp) / oneDayMs) > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  
  return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
}

export function formatTimePeriod(period: 'day' | 'week' | 'month' | 'all'): string {
  const labels = {
    day: 'Last 24 Hours',
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    all: 'All Time',
  };
  return labels[period];
}

export function filterByTimePeriod<T extends { timestamp: number }>(
  data: T[],
  period: 'day' | 'week' | 'month' | 'all'
): T[] {
  if (period === 'all') return data;
  
  const now = Date.now();
  const cutoffs = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };
  
  const cutoffTime = now - cutoffs[period];
  return data.filter((item) => item.timestamp >= cutoffTime);
}

export function calculateAccuracyOverTime(
  votes: { timestamp: number; won: boolean }[],
  windowSize: number = 10
): { timestamp: number; accuracy: number }[] {
  if (votes.length < windowSize) return [];
  
  const sorted = [...votes].sort((a, b) => a.timestamp - b.timestamp);
  const result: { timestamp: number; accuracy: number }[] = [];
  
  for (let i = windowSize - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - windowSize + 1, i + 1);
    const wins = window.filter((v) => v.won).length;
    const accuracy = (wins / windowSize) * 100;
    result.push({ timestamp: sorted[i].timestamp, accuracy });
  }
  
  return result;
}

export function formatLargeNumber(value: number | bigint): string {
  const num = typeof value === 'bigint' ? Number(value) : value;
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

export function getStatsColor(value: number, threshold: { good: number; bad: number }): string {
  if (value >= threshold.good) return 'text-emerald-400';
  if (value <= threshold.bad) return 'text-red-400';
  return 'text-amber-400';
}

