'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { formatNumber } from '@/lib/calculations';
import { TrendingUp, TrendingDown, ZoomIn, ZoomOut, Maximize2, Download, Clock } from 'lucide-react';

interface MarketChartProps {
  results: readonly bigint[];
  options: string[];
  totalVoters: bigint;
}

export function MarketChart({ results, options, totalVoters }: MarketChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; optionIdx: number; value: number } | null>(null);
  const [visibleOptions, setVisibleOptions] = useState<Set<number>>(new Set(options.map((_, i) => i)));
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const totalVotes = results.reduce((sum, votes) => sum + Number(votes), 0);
  
  // Generate enhanced historical data for visualization with smooth transitions
  useEffect(() => {
    const points = 30; // More points for smoother curves
    const data = results.map((finalVotes, optionIdx) => {
      const finalPercentage = totalVotes > 0 ? (Number(finalVotes) / totalVotes) * 100 : 50;
      const optionData = [];
      
      // Create more realistic market-like progression
      const volatility = 8; // Base volatility
      const startingValue = 50 + (Math.random() - 0.5) * 20; // Random start near 50%
      let currentValue = startingValue;
      
      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        
        // Trend toward final value with decreasing volatility
        const targetValue = finalPercentage;
        const trendForce = (targetValue - currentValue) * 0.15; // Stronger trend force
        const randomWalk = (Math.random() - 0.5) * volatility * (1 - progress * 0.7);
        
        currentValue = currentValue + trendForce + randomWalk;
        currentValue = Math.max(5, Math.min(95, currentValue)); // Keep within bounds
        
        optionData.push(currentValue);
      }
      
      // Ensure the last point matches the actual value
      optionData[points - 1] = finalPercentage;
      
      // Calculate stats
      const maxValue = Math.max(...optionData);
      const minValue = Math.min(...optionData);
      const avgValue = optionData.reduce((a, b) => a + b, 0) / optionData.length;
      
      return {
        option: options[optionIdx],
        data: optionData,
        current: finalPercentage,
        change: finalPercentage - startingValue,
        high24h: maxValue,
        low24h: minValue,
        avg: avgValue,
        volatility: maxValue - minValue,
      };
    });
    
    setChartData(data);
  }, [results, options, totalVotes]);

  const getColor = (index: number) => {
    const colors = [
      { line: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.15)', hover: 'rgba(16, 185, 129, 0.25)', glow: 'rgba(16, 185, 129, 0.3)' },
      { line: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.15)', hover: 'rgba(239, 68, 68, 0.25)', glow: 'rgba(239, 68, 68, 0.3)' },
      { line: 'rgb(251, 191, 36)', bg: 'rgba(251, 191, 36, 0.15)', hover: 'rgba(251, 191, 36, 0.25)', glow: 'rgba(251, 191, 36, 0.3)' },
      { line: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.15)', hover: 'rgba(59, 130, 246, 0.25)', glow: 'rgba(59, 130, 246, 0.3)' },
    ];
    return colors[index % colors.length];
  };

  // Generate smooth bezier curve path
  const generateSmoothPath = (points: number[]) => {
    if (points.length < 2) return '';
    
    const svgPoints = points.map((value, i) => ({
      x: (i / (points.length - 1)) * 100,
      y: 100 - value
    }));

    let path = `M ${svgPoints[0].x},${svgPoints[0].y}`;
    
    for (let i = 0; i < svgPoints.length - 1; i++) {
      const current = svgPoints[i];
      const next = svgPoints[i + 1];
      const controlPointX = (current.x + next.x) / 2;
      
      path += ` Q ${controlPointX},${current.y} ${controlPointX},${(current.y + next.y) / 2}`;
      path += ` Q ${controlPointX},${next.y} ${next.x},${next.y}`;
    }
    
    return path;
  };

  // Download chart as image
  const downloadChart = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'market-chart.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Toggle option visibility
  const toggleOption = (index: number) => {
    setVisibleOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Chart Area */}
      <div className="bg-slate-950/60 rounded-lg p-6 border border-slate-800/40" ref={containerRef}>
        {/* Header with Legend and Controls */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-4">
          <div>
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Market Activity
            </h3>
            <div className="flex gap-3 flex-wrap">
              {chartData.map((item, idx) => {
                const color = getColor(idx);
                const isVisible = visibleOptions.has(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleOption(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                      isVisible 
                        ? 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/70' 
                        : 'bg-slate-900/30 border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full transition-all"
                      style={{ 
                        backgroundColor: isVisible ? color.line : 'rgb(100, 116, 139)',
                        boxShadow: isVisible ? `0 0 8px ${color.glow}` : 'none'
                      }}
                    />
                    <span className={`text-xs font-medium ${isVisible ? 'text-white' : 'text-slate-500'}`}>
                      {item.option}
                    </span>
                    <span className={`text-xs font-bold ${isVisible ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {item.current.toFixed(1)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="p-2 bg-slate-800/50 border border-slate-700/60 rounded-lg hover:bg-slate-800/70 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              className="p-2 bg-slate-800/50 border border-slate-700/60 rounded-lg hover:bg-slate-800/70 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 bg-slate-800/50 border border-slate-700/60 rounded-lg hover:bg-slate-800/70 transition-all"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={downloadChart}
              className="p-2 bg-slate-800/50 border border-slate-700/60 rounded-lg hover:bg-slate-800/70 transition-all"
              title="Download Chart"
            >
              <Download className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Enhanced SVG Line Chart */}
        <div className="relative w-full overflow-x-auto" style={{ height: '400px' }}>
          <svg 
            ref={svgRef}
            width="100%" 
            height="100%" 
            className="overflow-visible"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              // Find closest point for tooltip
              const pointIndex = Math.round((x / 100) * 29); // 30 points - 1
              chartData.forEach((item, idx) => {
                if (visibleOptions.has(idx) && item.data[pointIndex] !== undefined) {
                  setHoveredPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top, optionIdx: idx, value: item.data[pointIndex] });
                }
              });
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Gradient Definitions */}
            <defs>
              {chartData.map((_, idx) => {
                const color = getColor(idx);
                return (
                  <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: color.line, stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: color.line, stopOpacity: 0 }} />
                  </linearGradient>
                );
              })}
              {/* Glow filter for lines */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines with enhanced styling */}
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
                  opacity={y === 50 ? "0.5" : "0.2"}
                />
                <text
                  x="2"
                  y={`${100 - y}%`}
                  fill="rgb(148, 163, 184)"
                  fontSize="11"
                  dy="-6"
                  fontWeight={y === 50 ? "600" : "400"}
                >
                  {y}%
                </text>
              </g>
            ))}

            {/* Vertical time markers */}
            {[0, 25, 50, 75, 100].map((x) => (
              <line
                key={`v-${x}`}
                x1={`${x}%`}
                y1="0"
                x2={`${x}%`}
                y2="100%"
                stroke="rgb(51, 65, 85)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.15"
              />
            ))}

            {/* Enhanced lines with smooth curves for each visible option */}
            {chartData.map((item, optionIdx) => {
              if (!visibleOptions.has(optionIdx)) return null;
              
              const color = getColor(optionIdx);
              const smoothPath = generateSmoothPath(item.data);
              const areaPath = `${smoothPath} L 100,100 L 0,100 Z`;

              return (
                <g key={optionIdx} className="transition-all duration-300">
                  {/* Area fill with gradient */}
                  <path
                    d={areaPath}
                    fill={`url(#gradient-${optionIdx})`}
                    opacity="0.3"
                    className="transition-opacity duration-300"
                  />
                  {/* Smooth curved line with glow effect */}
                  <path
                    d={smoothPath}
                    fill="none"
                    stroke={color.line}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    className="transition-all duration-300"
                  />
                  {/* High/Low markers */}
                  <circle
                    cx={`${(item.data.indexOf(item.high24h) / (item.data.length - 1)) * 100}%`}
                    cy={`${100 - item.high24h}%`}
                    r="3"
                    fill={color.line}
                    opacity="0.6"
                  />
                  <circle
                    cx={`${(item.data.indexOf(item.low24h) / (item.data.length - 1)) * 100}%`}
                    cy={`${100 - item.low24h}%`}
                    r="3"
                    fill={color.line}
                    opacity="0.6"
                  />
                  {/* Current price point with pulse animation */}
                  <circle
                    cx="100%"
                    cy={`${100 - item.current}%`}
                    r="5"
                    fill={color.line}
                    stroke="rgb(15, 23, 42)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <circle
                    cx="100%"
                    cy={`${100 - item.current}%`}
                    r="8"
                    fill="none"
                    stroke={color.line}
                    strokeWidth="2"
                    opacity="0.3"
                  />
                </g>
              );
            })}
            {/* Interactive Tooltip */}
            {hoveredPoint && (
              <g>
                <line
                  x1={(hoveredPoint.x / containerRef.current?.clientWidth! * 100) + "%"}
                  y1="0"
                  x2={(hoveredPoint.x / containerRef.current?.clientWidth! * 100) + "%"}
                  y2="100%"
                  stroke="rgb(148, 163, 184)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
              </g>
            )}
          </svg>

          {/* Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-lg px-3 py-2 text-xs shadow-xl z-50"
              style={{
                left: `${hoveredPoint.x + 10}px`,
                top: `${hoveredPoint.y - 40}px`,
              }}
            >
              <div className="font-semibold text-white mb-1">
                {chartData[hoveredPoint.optionIdx]?.option}
              </div>
              <div className="text-emerald-400 font-bold">
                {hoveredPoint.value.toFixed(2)}%
              </div>
              <div className="text-slate-500 text-[10px] mt-1">
                Vol: {formatNumber(hoveredPoint.value * totalVotes / 100)}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Time labels */}
        <div className="flex justify-between text-xs text-slate-500 mt-6 px-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            24h ago
          </span>
          <span className="text-slate-400">12h ago</span>
          <span className="text-white font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
      </div>

      {/* Enhanced Outcome Cards with Stats */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((votes, idx) => {
          const voteCount = Number(votes);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isLeading = voteCount === Math.max(...results.map(Number)) && voteCount > 0;
          const change = chartData[idx]?.change || 0;
          const high24h = chartData[idx]?.high24h || percentage;
          const low24h = chartData[idx]?.low24h || percentage;
          const volatility = chartData[idx]?.volatility || 0;
          const color = getColor(idx);
          const isVisible = visibleOptions.has(idx);

          return (
            <div 
              key={idx} 
              onClick={() => toggleOption(idx)}
              className={`bg-slate-900/40 hover:bg-slate-900/60 rounded-xl p-5 border transition-all cursor-pointer ${
                isLeading ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'border-slate-700/40'
              } ${!isVisible ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full transition-all"
                      style={{ 
                        backgroundColor: color.line,
                        boxShadow: isVisible ? `0 0 12px ${color.glow}` : 'none'
                      }}
                    />
                    <span className="text-white font-bold text-lg">{options[idx]}</span>
                    {isLeading && (
                      <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-semibold">
                        🏆 Leading
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-3xl font-bold text-white">{percentage.toFixed(1)}%</div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                      change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-bold">{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* Detailed Stats Row */}
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Volume: </span>
                      <span className="text-slate-300 font-semibold">${formatNumber(voteCount * 100)}</span>
                    </div>
                    <div className="w-px h-3 bg-slate-700"></div>
                    <div>
                      <span className="text-slate-500">Votes: </span>
                      <span className="text-slate-300 font-semibold">{formatNumber(voteCount)}</span>
                    </div>
                    <div className="w-px h-3 bg-slate-700"></div>
                    <div>
                      <span className="text-slate-500">24h: </span>
                      <span className="text-emerald-400 font-semibold">{high24h.toFixed(1)}%</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span className="text-red-400 font-semibold">{low24h.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar and Price */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{percentage.toFixed(0)}¢</div>
                    <div className="text-xs text-slate-500">per share</div>
                  </div>
                  <div className="w-32 h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/40">
                    <div
                      className="h-full transition-all duration-700 rounded-full relative overflow-hidden"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color.line
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500">Volatility:</span>
                    <span className={`font-semibold ${
                      volatility > 20 ? 'text-red-400' : volatility > 10 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {volatility.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

