'use client';

import { DAILY_CHALLENGES, DailyChallenge } from '@/lib/achievements';
import { Calendar, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DailyChallengesProps {
  todayStats?: {
    votes: number;
    categories: Set<string>;
    shared: boolean;
    commented: boolean;
  };
  onClaim?: (challengeId: string) => void;
}

export function DailyChallenges({ todayStats, onClaim }: DailyChallengesProps) {
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const stats = todayStats || { votes: 0, categories: new Set(), shared: false, commented: false };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Daily Challenges</h3>
        </div>
        <div className="text-xs text-slate-400">
          Resets in {timeUntilReset}
        </div>
      </div>

      <div className="space-y-3">
        {DAILY_CHALLENGES.map((challenge) => {
          const isCompleted = challenge.condition(stats);
          const progress = challenge.progress ? challenge.progress(stats) : null;

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border transition-all ${
                isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-700/30 border-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{challenge.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">
                      {challenge.name}
                    </h4>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold whitespace-nowrap">
                      <Gift className="w-3 h-3" />
                      +{challenge.reward}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {challenge.description}
                  </p>

                  {/* Progress */}
                  {!isCompleted && progress && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-400">
                          {progress.current}/{progress.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {isCompleted && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        ✓ Completed
                      </span>
                      {onClaim && (
                        <button
                          onClick={() => onClaim(challenge.id)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded text-white text-xs font-semibold transition-colors"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Rewards */}
      <div className="mt-4 p-3 bg-slate-700/30 border border-slate-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Today's Rewards</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-amber-400">
              {DAILY_CHALLENGES.filter((c) => c.condition(stats)).reduce((sum, c) => sum + c.reward, 0)}
            </span>
            <span className="text-xs text-slate-500">
              / {DAILY_CHALLENGES.reduce((sum, c) => sum + c.reward, 0)} REP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

