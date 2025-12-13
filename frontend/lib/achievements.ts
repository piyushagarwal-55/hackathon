export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (stats: UserStats) => boolean;
  progress?: (stats: UserStats) => { current: number; total: number };
}

export interface UserStats {
  totalVotes: number;
  totalWins: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  reputation: number;
  totalBetAmount: bigint;
  categoriesVoted: Set<string>;
  leaderboardRank?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-vote',
    name: 'First Steps',
    description: 'Cast your first vote',
    icon: '🎯',
    rarity: 'common',
    condition: (stats) => stats.totalVotes >= 1,
    progress: (stats) => ({ current: Math.min(stats.totalVotes, 1), total: 1 }),
  },
  {
    id: 'vote-10',
    name: 'Getting Started',
    description: 'Cast 10 votes',
    icon: '📊',
    rarity: 'common',
    condition: (stats) => stats.totalVotes >= 10,
    progress: (stats) => ({ current: Math.min(stats.totalVotes, 10), total: 10 }),
  },
  {
    id: 'vote-100',
    name: 'Century',
    description: 'Cast 100 votes',
    icon: '💯',
    rarity: 'rare',
    condition: (stats) => stats.totalVotes >= 100,
    progress: (stats) => ({ current: Math.min(stats.totalVotes, 100), total: 100 }),
  },
  {
    id: 'first-win',
    name: 'Beginner\'s Luck',
    description: 'Win your first prediction',
    icon: '🏆',
    rarity: 'common',
    condition: (stats) => stats.totalWins >= 1,
    progress: (stats) => ({ current: Math.min(stats.totalWins, 1), total: 1 }),
  },
  {
    id: 'profitable-trader',
    name: 'Profitable Trader',
    description: 'Win 10 predictions',
    icon: '💰',
    rarity: 'rare',
    condition: (stats) => stats.totalWins >= 10,
    progress: (stats) => ({ current: Math.min(stats.totalWins, 10), total: 10 }),
  },
  {
    id: 'streak-5',
    name: 'On Fire',
    description: 'Maintain a 5-day voting streak',
    icon: '🔥',
    rarity: 'rare',
    condition: (stats) => stats.currentStreak >= 5,
    progress: (stats) => ({ current: Math.min(stats.currentStreak, 5), total: 5 }),
  },
  {
    id: 'streak-10',
    name: 'Unstoppable',
    description: 'Maintain a 10-day voting streak',
    icon: '⚡',
    rarity: 'epic',
    condition: (stats) => stats.currentStreak >= 10,
    progress: (stats) => ({ current: Math.min(stats.currentStreak, 10), total: 10 }),
  },
  {
    id: 'accuracy-80',
    name: 'Market Expert',
    description: 'Achieve 80% win rate with 10+ votes',
    icon: '🎓',
    rarity: 'epic',
    condition: (stats) => stats.winRate >= 0.8 && stats.totalVotes >= 10,
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Join in the first week',
    icon: '🚀',
    rarity: 'legendary',
    condition: (stats) => stats.daysActive <= 7 && stats.totalVotes >= 1,
  },
  {
    id: 'category-master',
    name: 'Category Master',
    description: 'Vote in all 6 categories',
    icon: '🌟',
    rarity: 'epic',
    condition: (stats) => stats.categoriesVoted.size >= 6,
    progress: (stats) => ({ current: stats.categoriesVoted.size, total: 6 }),
  },
  {
    id: 'top-10',
    name: 'Reputation King',
    description: 'Reach top 10 on leaderboard',
    icon: '👑',
    rarity: 'legendary',
    condition: (stats) => (stats.leaderboardRank || 999) <= 10,
  },
  {
    id: 'diamond-hands',
    name: 'Diamond Hands',
    description: 'Hold positions until market end 5 times',
    icon: '💎',
    rarity: 'rare',
    condition: (stats) => stats.totalVotes >= 5, // Simplified for demo
  },
];

export interface Level {
  level: number;
  name: string;
  minRep: number;
  maxRep: number;
  color: string;
  bgColor: string;
  benefits: string[];
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: 'Novice',
    minRep: 0,
    maxRep: 99,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    benefits: ['Access to all markets', 'Basic voting power'],
  },
  {
    level: 2,
    name: 'Participant',
    minRep: 100,
    maxRep: 499,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    benefits: ['1.5x vote multiplier', 'Access to trending markets'],
  },
  {
    level: 3,
    name: 'Trader',
    minRep: 500,
    maxRep: 999,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    benefits: ['2x vote multiplier', 'Create featured markets'],
  },
  {
    level: 4,
    name: 'Expert',
    minRep: 1000,
    maxRep: 4999,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    benefits: ['2.5x vote multiplier', 'Exclusive market access', 'Verified badge'],
  },
  {
    level: 5,
    name: 'Master',
    minRep: 5000,
    maxRep: Infinity,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    benefits: ['3x vote multiplier', 'VIP status', 'Revenue sharing'],
  },
];

export function getLevelFromRep(reputation: number): Level {
  return LEVELS.find((level) => reputation >= level.minRep && reputation <= level.maxRep) || LEVELS[0];
}

export function getNextLevel(reputation: number): Level | null {
  const currentLevel = getLevelFromRep(reputation);
  const currentIndex = LEVELS.findIndex((l) => l.level === currentLevel.level);
  return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
}

export function getLevelProgress(reputation: number): number {
  const currentLevel = getLevelFromRep(reputation);
  if (currentLevel.maxRep === Infinity) return 100;
  
  const progress = ((reputation - currentLevel.minRep) / (currentLevel.maxRep - currentLevel.minRep + 1)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  condition: (todayStats: { votes: number; categories: Set<string>; shared: boolean; commented: boolean }) => boolean;
  progress?: (todayStats: { votes: number; categories: Set<string>; shared: boolean; commented: boolean }) => { current: number; total: number };
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'vote-3',
    name: 'Daily Voter',
    description: 'Vote on 3 markets today',
    icon: '🗳️',
    reward: 10,
    condition: (stats) => stats.votes >= 3,
    progress: (stats) => ({ current: Math.min(stats.votes, 3), total: 3 }),
  },
  {
    id: 'new-category',
    name: 'Category Explorer',
    description: 'Try a new category today',
    icon: '🧭',
    reward: 15,
    condition: (stats) => stats.categories.size >= 2,
    progress: (stats) => ({ current: Math.min(stats.categories.size, 2), total: 2 }),
  },
  {
    id: 'share-market',
    name: 'Social Butterfly',
    description: 'Share a market on social media',
    icon: '📱',
    reward: 5,
    condition: (stats) => stats.shared,
    progress: (stats) => ({ current: stats.shared ? 1 : 0, total: 1 }),
  },
  {
    id: 'comment',
    name: 'Community Voice',
    description: 'Comment on a market discussion',
    icon: '💬',
    reward: 10,
    condition: (stats) => stats.commented,
    progress: (stats) => ({ current: stats.commented ? 1 : 0, total: 1 }),
  },
];

export function checkAchievements(stats: UserStats, unlockedIds: Set<string>): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => !unlockedIds.has(achievement.id) && achievement.condition(stats));
}

export function getRarityColor(rarity: Achievement['rarity']): { text: string; bg: string; border: string } {
  const colors = {
    common: { text: 'text-slate-300', bg: 'bg-slate-700/50', border: 'border-slate-600' },
    rare: { text: 'text-blue-300', bg: 'bg-blue-900/50', border: 'border-blue-600' },
    epic: { text: 'text-purple-300', bg: 'bg-purple-900/50', border: 'border-purple-600' },
    legendary: { text: 'text-amber-300', bg: 'bg-amber-900/50', border: 'border-amber-600' },
  };
  return colors[rarity];
}

