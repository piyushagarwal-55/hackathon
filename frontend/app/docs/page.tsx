'use client';

import { BookOpen, Shield, TrendingUp, Users, Code, Zap, Lock, Award } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PageHeader } from '@/components/PageHeader';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Navigation showCreateButton={false} />
      <PageHeader
        title="Documentation"
        subtitle="Learn how RepVote works and how to participate in governance"
        icon={<BookOpen className="w-5 h-5 text-emerald-300" />}
      />

      {/* Main Content */}
      <main className="rv-container py-8">
        <div className="max-w-6xl mx-auto">
        {/* Quick Start */}
        <section className="mb-12 rv-card p-8 border-emerald-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-400" />
            Quick Start
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rv-card-soft rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-2">1</div>
              <h3 className="font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-sm text-slate-400">
                Connect your MetaMask or Web3 wallet to the Arbitrum Sepolia network
              </p>
            </div>
            <div className="rv-card-soft rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-2">2</div>
              <h3 className="font-semibold text-white mb-2">Vote on Polls</h3>
              <p className="text-sm text-slate-400">
                Browse active polls and cast your votes to earn reputation
              </p>
            </div>
            <div className="rv-card-soft rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-2">3</div>
              <h3 className="font-semibold text-white mb-2">Build Reputation</h3>
              <p className="text-sm text-slate-400">
                Gain reputation to increase your voting power and governance influence
              </p>
            </div>
          </div>
        </section>

        {/* Core Concepts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Core Concepts</h2>
          <div className="space-y-6">
            {/* Reputation System */}
            <div className="rv-card p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <Award className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Reputation System</h3>
                  <p className="text-slate-300 mb-4">
                    RepVote uses a reputation-based system to reward active participants and prevent Sybil attacks.
                  </p>
                  <div className="rv-card-soft rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-mono">+10 REP</span>
                      <span className="text-slate-400">per vote cast</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-mono">0.3x - 3x</span>
                      <span className="text-slate-400">vote multiplier based on reputation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-mono">-5%/month</span>
                      <span className="text-slate-400">decay for inactive users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quadratic Voting */}
            <div className="rv-card p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-500/20 rounded-lg border border-teal-500/30">
                  <TrendingUp className="w-6 h-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Quadratic Voting</h3>
                  <p className="text-slate-300 mb-4">
                    Vote weight scales with the square root of credits spent, preventing vote concentration.
                  </p>
                  <div className="rv-card-soft rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-2">Formula:</p>
                    <p className="font-mono text-emerald-400 text-lg">
                      vote_weight = √(credits) × reputation_multiplier
                    </p>
                    <p className="text-xs text-slate-500 mt-3">
                      Example: 9 credits with 1.5x multiplier = √9 × 1.5 = 4.5 weighted votes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sybil Resistance */}
            <div className="rv-card p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Sybil Resistance</h3>
                  <p className="text-slate-300 mb-4">
                    Multiple layers of protection against fake accounts and vote manipulation.
                  </p>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span><strong>New accounts</strong> start with 0.3x vote multiplier</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span><strong>Reputation decay</strong> prevents abandoned account reuse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span><strong>Vote weight cap</strong> limits influence of any single voter</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reputation Tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Reputation Tiers</h2>
          <div className="rv-card p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div>
                  <p className="font-semibold text-slate-400">New User</p>
                  <p className="text-xs text-slate-500">0-9 reputation</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-400">0.3x</p>
                  <p className="text-xs text-slate-500">multiplier</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div>
                  <p className="font-semibold text-blue-400">Participant</p>
                  <p className="text-xs text-slate-500">10-49 reputation</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">0.5x</p>
                  <p className="text-xs text-slate-500">multiplier</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-emerald-500/30">
                <div>
                  <p className="font-semibold text-emerald-400">Regular</p>
                  <p className="text-xs text-slate-500">50-99 reputation</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">1.0x</p>
                  <p className="text-xs text-slate-500">multiplier</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-amber-500/30">
                <div>
                  <p className="font-semibold text-amber-400">Active</p>
                  <p className="text-xs text-slate-500">100-499 reputation</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-400">1.5x</p>
                  <p className="text-xs text-slate-500">multiplier</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-orange-500/30">
                <div>
                  <p className="font-semibold text-orange-400">Veteran</p>
                  <p className="text-xs text-slate-500">500-999 reputation</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">2.0x</p>
                  <p className="text-xs text-slate-500">multiplier</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <div>
                  <p className="font-semibold text-purple-400">Legend</p>
                  <p className="text-xs text-slate-500">1000+ reputation</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-400">3.0x</p>
                  <p className="text-xs text-slate-500">multiplier</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Technical Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rv-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Smart Contracts</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><span className="text-slate-500">• Language:</span> Solidity 0.8.19</li>
                <li><span className="text-slate-500">• Network:</span> Arbitrum Sepolia</li>
                <li><span className="text-slate-500">• Framework:</span> Foundry</li>
                <li><span className="text-slate-500">• Architecture:</span> Factory Pattern</li>
              </ul>
            </div>

            <div className="rv-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Security</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><span className="text-slate-500">• Audited:</span> Internal Review</li>
                <li><span className="text-slate-500">• Access Control:</span> Role-based</li>
                <li><span className="text-slate-500">• Reentrancy:</span> Protected</li>
                <li><span className="text-slate-500">• Gas Optimized:</span> Yes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="rv-card p-6">
              <h3 className="text-lg font-semibold text-white mb-2">How do I earn reputation?</h3>
              <p className="text-slate-300 text-sm">
                You earn 10 reputation points for each vote you cast. Participate consistently to build your reputation and increase your voting power.
              </p>
            </div>

            <div className="rv-card p-6">
              <h3 className="text-lg font-semibold text-white mb-2">What happens if I don't vote for a long time?</h3>
              <p className="text-slate-300 text-sm">
                Your reputation decays at 5% per month of inactivity. This prevents abandoned accounts from being reused and encourages active participation.
              </p>
            </div>

            <div className="rv-card p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Can I change my vote?</h3>
              <p className="text-slate-300 text-sm">
                No, votes are final once submitted. This prevents manipulation and ensures voting integrity. Consider your choice carefully before voting.
              </p>
            </div>

            <div className="rv-card p-6">
              <h3 className="text-lg font-semibold text-white mb-2">How many credits should I spend?</h3>
              <p className="text-slate-300 text-sm">
                You can spend 1-100 credits per vote. Due to quadratic voting, spending more credits has diminishing returns. For example, 100 credits gives √100 = 10 base votes, while 25 credits gives 5 base votes.
              </p>
            </div>
          </div>
        </section>

        {/* Get Help */}
        <section className="rv-card p-8 border-emerald-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-slate-300 mb-6">
            Join our community or explore more resources:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com"
              className="rv-btn-secondary"
            >
              📚 View on GitHub
            </a>
            <a
              href="https://discord.com"
              className="rv-btn-secondary"
            >
              💬 Join Discord
            </a>
            <a
              href="https://twitter.com"
              className="rv-btn-secondary"
            >
              🐦 Follow on Twitter
            </a>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}

