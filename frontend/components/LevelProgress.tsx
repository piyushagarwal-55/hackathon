'use client';

import { getLevelFromRep, getNextLevel, getLevelProgress } from '@/lib/achievements';
import { TrendingUp } from 'lucide-react';

interface LevelProgressProps {
  reputation: number;
  compact?: boolean;
}

export function LevelProgress({ reputation, compact = false }: LevelProgressProps) {
  const currentLevel = getLevelFromRep(reputation);
  const nextLevel = getNextLevel(reputation);
  const progress = getLevelProgress(reputation);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1 ${currentLevel.bgColor} border border-${currentLevel.color.replace('text-', '')} rounded-lg`}>
          <span className={`text-sm font-bold ${currentLevel.color}`}>
            Lv.{currentLevel.level} {currentLevel.name}
          </span>
        </div>
        {nextLevel && (
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Next: {nextLevel.name}</span>
              <span className="text-slate-300">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className={`w-6 h-6 ${currentLevel.color}`} />
        <h3 className="text-lg font-bold text-white">Your Level</h3>
      </div>

      {/* Current Level Badge */}
      <div className={`${currentLevel.bgColor} border border-${currentLevel.color.replace('text-', '')} rounded-lg p-4 mb-4`}>
        <div className="text-center">
          <div className={`text-4xl font-bold ${currentLevel.color} mb-1`}>
            Level {currentLevel.level}
          </div>
          <div className={`text-xl font-semibold ${currentLevel.color}`}>
            {currentLevel.name}
          </div>
          <div className="text-slate-400 text-sm mt-2">
            {reputation.toLocaleString()} REP
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">Benefits</h4>
        <ul className="space-y-1">
          {currentLevel.benefits.map((benefit, index) => (
            <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Progress to Next Level */}
      {nextLevel && (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Progress to {nextLevel.name}</span>
            <span className="text-slate-300 font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            {nextLevel.minRep - reputation} REP until next level
          </p>
        </div>
      )}

      {/* Max Level */}
      {!nextLevel && (
        <div className="text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <span className="text-amber-400 font-semibold text-sm">
            🎉 Max Level Reached!
          </span>
        </div>
      )}
    </div>
  );
}

