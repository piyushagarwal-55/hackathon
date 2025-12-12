'use client';

import { useReadContract } from 'wagmi';
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from '@/lib/contracts';

export function StatsDashboard() {
  const { data: pollCount } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: 'getPollCount',
  });

  const stats = [
    {
      icon: '📊',
      label: 'Total Polls',
      value: pollCount?.toString() || '0',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: '🗳️',
      label: 'Total Votes Cast',
      value: '47',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: '👥',
      label: 'Active Voters',
      value: '12',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      icon: '⚡',
      label: 'Sybil Attacks Blocked',
      value: '82%',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-lg rounded-2xl p-6 border ${stat.borderColor} hover:scale-105 transition-transform`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl">{stat.icon}</div>
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.color} animate-pulse`} />
          </div>
          <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}


