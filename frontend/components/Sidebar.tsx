'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, BarChart3, Users, BookOpen, Home } from 'lucide-react';
import { useAccount } from 'wagmi';

export function Sidebar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/', id: 'dashboard' },
    { icon: BarChart3, label: 'Active Polls', href: '/polls', id: 'polls' },
    { icon: Users, label: 'Governance', href: '/governance', id: 'governance' },
    { icon: BookOpen, label: 'Docs', href: '/docs', id: 'docs' },
  ];

  const isActive = (id: string) => {
    if (id === 'dashboard') return pathname === '/';
    return pathname.includes(id);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">RepVote</h1>
            <p className="text-xs text-slate-400">Voting Protocol</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full transition-all ${
                  active ? 'bg-emerald-400' : 'bg-transparent group-hover:bg-slate-600'
                }`}
              />
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Connect Button */}
      <div className="p-4 border-t border-slate-800/30">
        {isConnected && address ? (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 mb-4">
            <p className="text-xs text-slate-400 mb-2">Connected Wallet</p>
            <p className="text-sm font-mono text-emerald-400 truncate">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        ) : null}
        <div className="flex justify-center">
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-slate-800/30 text-center text-xs text-slate-500">
        <p>RepVote • v1.0</p>
      </div>
    </aside>
  );
}
