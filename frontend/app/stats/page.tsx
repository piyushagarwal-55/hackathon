'use client';

import { Navigation } from '@/components/Navigation';
import { LevelProgress } from '@/components/LevelProgress';
import { AchievementBadge } from '@/components/AchievementBadge';
import { ACHIEVEMENTS, UserStats } from '@/lib/achievements';
import { getStatsColor } from '@/lib/analytics';
import { useAccount, useReadContract } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI } from '@/lib/contracts';
import { TrendingUp, Target, Award, Zap, Calendar, Trophy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { formatUnits } from 'viem';
import { useUserStats } from '@/hooks/useUserStats';

export default function StatsPage() {
  const { address, isConnected } = useAccount();
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'all'>('all');

  // Fetch real-time user stats
  const { stats: personalStats, isLoading: statsLoading } = useUserStats();

  // Get user's reputation
  const { data: multiplierData } = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'getRepMultiplier',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  });

  const reputation = multiplierData ? Number(formatUnits(multiplierData, 18)) * 100 : 0;

  // User stats for achievements
  const userStats: UserStats = {
    totalVotes: personalStats?.totalVotes || 0,
    totalWins: personalStats?.totalWins || 0,
    winRate: personalStats ? personalStats.winRate / 100 : 0,
    currentStreak: personalStats?.currentStreak || 0,
    longestStreak: personalStats?.longestStreak || 0,
    daysActive: 1,
    reputation,
    totalBetAmount: 0n,
    categoriesVoted: new Set(Object.keys(personalStats?.votesByCategory || {})),
  };

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.condition(userStats));
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !a.condition(userStats));

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0f1419]">
        <Navigation showCreateButton={false} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400">Connect your wallet to view your statistics</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Navigation showCreateButton={false} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Statistics</h1>
          <p className="text-slate-400">Your performance and achievements</p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-2 mb-8">
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timePeriod === period
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {statsLoading ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Loading Statistics...</h3>
            <p className="text-slate-400">Analyzing your performance data</p>
          </div>
        ) : !personalStats ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
            <p className="text-slate-400">Start voting on markets to build your statistics</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400">Total Votes</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{personalStats.totalVotes}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-400">Win Rate</span>
                  </div>
                  <p className={`text-2xl font-bold ${getStatsColor(personalStats.winRate, { good: 60, bad: 40 })}`}>
                    {personalStats.winRate.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-400">Total Wins</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{personalStats.totalWins}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-400">Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{personalStats.currentStreak}d</p>
                </div>
              </div>

            {/* Achievements */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Achievements</h3>
                </div>
                <span className="text-sm text-slate-400">
                  {unlockedAchievements.length} / {ACHIEVEMENTS.length}
                </span>
              </div>

              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">Unlocked</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {unlockedAchievements.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={true}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Locked</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {lockedAchievements.slice(0, 8).map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={false}
                        progress={achievement.progress ? achievement.progress(userStats) : undefined}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Performance */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Category Performance</h3>
              </div>
              
              {Object.keys(personalStats.votesByCategory).length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No category data yet. Start voting to see your performance!
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(personalStats.votesByCategory).map(([category, votes]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 capitalize">{category}</span>
                      <span className="text-sm font-semibold text-white">{votes} votes</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Level Progress */}
            <LevelProgress reputation={reputation} />

            {/* Quick Stats */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Longest Streak</p>
                  <p className="text-xl font-bold text-purple-400">{personalStats.longestStreak} days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Best Category</p>
                  <p className="text-xl font-bold text-white capitalize">{personalStats.bestCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total Losses</p>
                  <p className="text-xl font-bold text-slate-400">{personalStats.totalLosses}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

