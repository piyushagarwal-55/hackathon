/**
 * Vote weight calculation utilities
 * Mirrors the smart contract logic for client-side preview
 */

/**
 * Calculate vote weight preview
 * @param credits Amount of credits user wants to spend
 * @param multiplier Reputation multiplier (in 18 decimals, e.g., 1.5e18)
 * @returns Expected weighted votes
 */
export function calculateVoteWeight(credits: number, multiplier: bigint): number {
  // √(credits) × multiplier
  const sqrtCredits = Math.sqrt(credits);
  const multiplierAsNumber = Number(multiplier) / 1e18;
  return sqrtCredits * multiplierAsNumber;
}

/**
 * Get reputation level name from multiplier
 */
export function getReputationLevel(multiplier: bigint): {
  level: string;
  color: string;
  description: string;
} {
  const mult = Number(multiplier) / 1e18;
  
  if (mult >= 3) {
    return {
      level: 'Expert',
      color: 'text-green-400',
      description: '1000+ reputation',
    };
  } else if (mult >= 2) {
    return {
      level: 'Veteran',
      color: 'text-blue-400',
      description: '500+ reputation',
    };
  } else if (mult >= 1.5) {
    return {
      level: 'Active',
      color: 'text-cyan-400',
      description: '100+ reputation',
    };
  } else if (mult >= 1) {
    return {
      level: 'Regular',
      color: 'text-yellow-400',
      description: '50+ reputation',
    };
  } else if (mult >= 0.5) {
    return {
      level: 'Newcomer',
      color: 'text-orange-400',
      description: '10+ reputation',
    };
  } else {
    return {
      level: 'New User',
      color: 'text-red-400',
      description: 'Less than 10 reputation',
    };
  }
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate time remaining until deadline
 */
export function getTimeRemaining(endTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(endTime);
  const remaining = end - now;
  
  if (remaining <= 0) {
    return 'Ended';
  }
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}
