export interface Position {
  marketAddress: string;
  marketQuestion: string;
  selectedOption: number;
  betAmount: bigint;
  voteWeight: bigint;
  timestamp: number;
  isActive: boolean;
  isWinner?: boolean;
  winnings?: bigint;
  category?: string;
}

export interface PnLSummary {
  totalInvested: bigint;
  totalReturned: bigint;
  currentValue: bigint;
  unrealizedPnL: bigint;
  realizedPnL: bigint;
  roiPercentage: number;
  winCount: number;
  lossCount: number;
  pendingCount: number;
}

export function calculatePnL(positions: Position[]): PnLSummary {
  let totalInvested = 0n;
  let totalReturned = 0n;
  let currentValue = 0n;
  let winCount = 0;
  let lossCount = 0;
  let pendingCount = 0;

  for (const position of positions) {
    totalInvested += position.betAmount;

    if (!position.isActive) {
      // Market ended
      if (position.isWinner && position.winnings) {
        totalReturned += position.winnings;
        winCount++;
      } else {
        lossCount++;
      }
    } else {
      // Market still active
      currentValue += position.betAmount; // Simplified: use bet amount as current value
      pendingCount++;
    }
  }

  const realizedPnL = totalReturned - (totalInvested - currentValue);
  const unrealizedPnL = 0n; // Could be calculated based on current odds
  const totalPnL = realizedPnL + unrealizedPnL;
  
  const roiPercentage = totalInvested > 0n
    ? Number((totalPnL * 10000n) / totalInvested) / 100
    : 0;

  return {
    totalInvested,
    totalReturned,
    currentValue,
    unrealizedPnL,
    realizedPnL,
    roiPercentage,
    winCount,
    lossCount,
    pendingCount,
  };
}

export function formatPnL(value: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
  return `${whole}.${fractionStr}`;
}

export function getPnLColor(value: bigint): string {
  if (value > 0n) return 'text-emerald-400';
  if (value < 0n) return 'text-red-400';
  return 'text-slate-400';
}

export function getPnLSign(value: bigint): string {
  if (value > 0n) return '+';
  return '';
}

