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
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 z-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-emerald-400 font-medium text-sm flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            TESTNET DEMO - Using Free Mock Tokens (No Real Money)
          </span>
        </div>
      </div>

      <nav className="sticky top-0 z-40 bg-[#0f1419] border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30">
                R
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">RepVote</span>
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

