'use client';

import { Achievement, getRarityColor } from '@/lib/achievements';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: { current: number; total: number };
  compact?: boolean;
  onClick?: () => void;
}

export function AchievementBadge({ achievement, unlocked, progress, compact = false, onClick }: AchievementBadgeProps) {
  const { text, bg, border } = getRarityColor(achievement.rarity);
  
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`relative flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all ${
          unlocked
            ? `${bg} ${border} hover:scale-110`
            : 'bg-slate-800/50 border-slate-700 opacity-50'
        }`}
        title={achievement.name}
      >
        <span className="text-2xl">{unlocked ? achievement.icon : '🔒'}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        unlocked
          ? `${bg} ${border} hover:scale-105 cursor-pointer`
          : 'bg-slate-800/50 border-slate-700/50 opacity-60'
      }`}
    >
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${text} uppercase`}>
        {achievement.rarity}
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 mb-3 mx-auto">
        {unlocked ? (
          <span className="text-5xl">{achievement.icon}</span>
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
            <Lock className="w-8 h-8 text-slate-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <h4 className="text-center text-white font-bold mb-1">{achievement.name}</h4>
      <p className="text-center text-slate-400 text-sm mb-3">{achievement.description}</p>

      {/* Progress Bar */}
      {!unlocked && progress && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-300">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${bg} transition-all duration-300`}
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlocked Badge */}
      {unlocked && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-xs font-semibold">
            ✓ Unlocked
          </span>
        </div>
      )}
    </div>
  );
}

