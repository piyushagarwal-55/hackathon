'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/calculations';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketChartProps {
  results: readonly bigint[];
  options: string[];
  totalVoters: bigint;
}

export function MarketChart({ results, options, totalVoters }: MarketChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  
  const totalVotes = results.reduce((sum, votes) => sum + Number(votes), 0);
  
  // Generate mock historical data for visualization
  useEffect(() => {
    const data = [];
    const points = 20;
    
    results.forEach((finalVotes, optionIdx) => {
      const finalPercentage = totalVotes > 0 ? (Number(finalVotes) / totalVotes) * 100 : 50;
      const optionData = [];
      
      // Generate a realistic progression to the final value
      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        // Add some randomness but trend toward final value
        const variance = (Math.random() - 0.5) * 10;
        const value = 50 + (finalPercentage - 50) * progress + variance * (1 - progress);
        optionData.push(Math.max(0, Math.min(100, value)));
      }
      
      data.push({
        option: options[optionIdx],
        data: optionData,
        current: finalPercentage,
        change: finalPercentage - 50,
      });
    });
    
    setChartData(data);
  }, [results, options, totalVotes]);

  const getColor = (index: number) => {
    const colors = [
      { line: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.1)', hover: 'rgba(16, 185, 129, 0.2)' },
      { line: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)', hover: 'rgba(239, 68, 68, 0.2)' },
      { line: 'rgb(251, 191, 36)', bg: 'rgba(251, 191, 36, 0.1)', hover: 'rgba(251, 191, 36, 0.2)' },
      { line: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)', hover: 'rgba(59, 130, 246, 0.2)' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Chart Area */}
      <div className="bg-slate-950/60 rounded-lg p-6 border border-slate-800/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Market Activity</h3>
          <div className="flex gap-4 text-xs">
            {chartData.map((item, idx) => {
              const color = getColor(idx);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color.line }}
                  />
                  <span className="text-slate-400">{item.option}</span>
                  <span className="font-semibold text-white">{item.current.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SVG Line Chart */}
        <div className="relative w-full" style={{ height: '280px' }}>
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <g key={y}>
                <line
                  x1="0"
                  y1={`${100 - y}%`}
                  x2="100%"
                  y2={`${100 - y}%`}
                  stroke="rgb(51, 65, 85)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
                <text
                  x="0"
                  y={`${100 - y}%`}
                  fill="rgb(148, 163, 184)"
                  fontSize="10"
                  dy="-4"
                >
                  {y}%
                </text>
              </g>
            ))}

            {/* Lines for each option */}
            {chartData.map((item, optionIdx) => {
              const color = getColor(optionIdx);
              const points = item.data.map((value: number, i: number) => {
                const x = (i / (item.data.length - 1)) * 100;
                const y = 100 - value;
                return `${x},${y}`;
              }).join(' ');

              const pathD = `M ${points.split(' ').join(' L ')}`;

              return (
                <g key={optionIdx}>
                  {/* Area fill */}
                  <path
                    d={`${pathD} L 100,100 L 0,100 Z`}
                    fill={color.bg}
                    opacity="0.2"
                  />
                  {/* Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color.line}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* End point */}
                  <circle
                    cx="100%"
                    cy={`${100 - item.current}%`}
                    r="4"
                    fill={color.line}
                    stroke="rgb(15, 23, 42)"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
          <span>Start</span>
          <span>Now</span>
        </div>
      </div>

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((votes, idx) => {
          const voteCount = Number(votes);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isLeading = voteCount === Math.max(...results.map(Number)) && voteCount > 0;
          const change = chartData[idx]?.change || 0;
          const color = getColor(idx);

          return (
            <div 
              key={idx} 
              className={`bg-slate-900/40 hover:bg-slate-900/60 rounded-lg p-4 border transition-all cursor-pointer ${
                isLeading ? 'border-emerald-500/40' : 'border-slate-700/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color.line }}
                    />
                    <span className="text-white font-semibold">{options[idx]}</span>
                    {isLeading && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs text-emerald-400 font-medium">
                        Leading
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-white">{percentage.toFixed(1)}%</div>
                    <div className={`flex items-center gap-1 text-sm ${
                      change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    ${formatNumber(voteCount * 100)} Vol. • {formatNumber(voteCount)} votes
                  </div>
                </div>
                
                {/* Mini bar indicator */}
                <div className="flex flex-col items-end gap-1">
                  <div className="w-32 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color.line
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {percentage.toFixed(0)}¢
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

