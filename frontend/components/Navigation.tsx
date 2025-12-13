'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useReadContract } from 'wagmi';
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from '@/lib/contracts';

interface NavigationProps {
  onCreateClick?: () => void;
  showCreateButton?: boolean;
}

export function Navigation({ onCreateClick, showCreateButton = true }: NavigationProps) {
  const pathname = usePathname();

  const { data: pollCount } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: 'getPollCount',
    query: { refetchInterval: 15000 },
  });

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Testnet Banner */}
      <div className="bg-amber-500/20 border-b border-amber-500/30 py-2 z-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-amber-400 font-semibold text-sm">
            🚧 TESTNET DEMO - Using Free Mock Tokens (No Real Money)
          </span>
        </div>
      </div>

      <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-slate-900">
                R
              </div>
              <span className="text-xl font-bold text-white">RepVote</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Markets
              </Link>
              <Link
                href="/polls"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/polls')
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Polls
              </Link>
              <Link
                href="/governance"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/governance')
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Governance
              </Link>
              <Link
                href="/docs"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/docs')
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Docs
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-800/40 rounded-lg border border-slate-700/40">
              <span className="text-slate-400">Markets:</span>
              <span className="font-bold text-white">{pollCount?.toString() ?? '—'}</span>
            </div>
            {showCreateButton && onCreateClick && (
              <button
                onClick={onCreateClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg text-white font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>
            )}
            {/* Wallet Connection */}
            <div className="flex items-center">
              <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
            </div>
          </div>
        </div>
      </div>
      </nav>
    </>
  );
}

