'use client';

import { useAccount, useBlockNumber } from 'wagmi';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NetworkHealth() {
  const { chain, chainId } = useAccount();
  const { data: blockNumber, isLoading, isError, error } = useBlockNumber({
    watch: true,
    query: {
      refetchInterval: 10000, // Check every 10 seconds
    },
  });

  const [lastSuccessTime, setLastSuccessTime] = useState<number | null>(null);
  const [isHealthy, setIsHealthy] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastSuccessTime(Date.now());
  }, []);

  useEffect(() => {
    if (!isLoading && !isError && blockNumber) {
      setLastSuccessTime(Date.now());
      setIsHealthy(true);
    } else if (isError) {
      setIsHealthy(false);
    }
  }, [blockNumber, isLoading, isError]);

  const timeSinceLastSuccess = lastSuccessTime ? Math.floor((Date.now() - lastSuccessTime) / 1000) : 0;
  const isDegraded = timeSinceLastSuccess > 30; // More than 30 seconds since last success

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted || !chain) {
    return null;
  }

  return (
    <div className={`rounded-lg p-3 border ${
      isHealthy && !isDegraded
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : isDegraded
        ? 'bg-amber-500/10 border-amber-500/30'
        : 'bg-red-500/10 border-red-500/30'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isHealthy && !isDegraded ? (
            <Wifi className="w-4 h-4 text-emerald-400" />
          ) : isDegraded ? (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <div>
            <p className="text-xs font-semibold text-white">
              {chain.name}
            </p>
            <p className="text-xs text-slate-400">
              {isLoading ? 'Checking...' : isError ? 'Connection Error' : `Block #${blockNumber?.toString() || 'N/A'}`}
            </p>
          </div>
        </div>
        {isDegraded && (
          <div className="text-xs text-amber-400">
            {timeSinceLastSuccess > 60 
              ? `${Math.floor(timeSinceLastSuccess / 60)}m ago`
              : `${timeSinceLastSuccess}s ago`}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-2">
          {error.message || 'RPC connection issue'}
        </p>
      )}
    </div>
  );
}

