'use client';

import { useEffect, useMemo, useState } from 'react';
import { PollList } from '@/components/PollList';
import { VoteCard } from '@/components/VoteCard';
import { ResultsChart } from '@/components/ResultsChart';
import { ShareModal } from '@/components/ShareModal';
import { BarChart3, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { usePublicClient, useReadContract } from 'wagmi';
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI, POLL_ABI } from '@/lib/contracts';

export default function PollsPage() {
  const [selectedPoll, setSelectedPoll] = useState<{
    address: string;
    options: string[];
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{ address: string; question: string } | null>(null);
  const publicClient = usePublicClient();
  const [activeCount, setActiveCount] = useState<number | null>(null);

  const { data: pollCount } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: 'getPollCount',
    query: { refetchInterval: 15000 },
  });

  const { data: recentPolls } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: 'getRecentPolls',
    args: [25n],
    query: { refetchInterval: 15000 },
  });

  const recentPollList = useMemo(() => (recentPolls ? [...recentPolls] : []), [recentPolls]);

  const handleVoteSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleShare = (address: string, question: string) => {
    setShareData({ address, question });
    setIsShareOpen(true);
  };

  // Compute active count via multicall (no dynamic hooks)
  useEffect(() => {
    const run = async () => {
      if (!publicClient || recentPollList.length === 0) {
        setActiveCount(null);
        return;
      }
      try {
        const calls = recentPollList.map((addr) => ({
          address: addr as `0x${string}`,
          abi: POLL_ABI,
          functionName: 'isActive' as const,
        }));
        const res = await publicClient.multicall({ contracts: calls, allowFailure: true });
        const active = res.filter((r) => r.status === 'success' && r.result === true).length;
        setActiveCount(active);
      } catch {
        setActiveCount(null);
      }
    };
    run();
  }, [publicClient, recentPollList]);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Active Polls"
        subtitle="Browse polls and vote with reputation-weighted quadratic voting"
        icon={<BarChart3 className="w-5 h-5 text-emerald-300" />}
      >
        <div className="flex flex-wrap gap-2">
          <span className="rv-chip">
            <span className="text-slate-400">Total</span>
            <span className="text-white">{pollCount?.toString() ?? '—'}</span>
          </span>
          <span className="rv-chip">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-slate-400">Active (recent)</span>
            <span className="text-white">{activeCount ?? '—'}</span>
          </span>
          {selectedPoll ? (
            <span className="rv-chip">
              <span className="text-slate-400">Selected</span>
              <span className="font-mono text-white">
                {selectedPoll.address.slice(0, 6)}…{selectedPoll.address.slice(-4)}
              </span>
            </span>
          ) : null}
        </div>
      </PageHeader>

      {/* Main Content */}
      <main className="rv-container py-8 space-y-8">

        {/* Poll List */}
        <PollList
          onSelectPoll={(address, options) => setSelectedPoll({ address, options })}
          refreshTrigger={refreshTrigger}
          onShare={handleShare}
        />

        {/* Vote and Results Grid - Show if poll selected */}
        {selectedPoll && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VoteCard
              pollAddress={selectedPoll.address as `0x${string}`}
              options={selectedPoll.options}
              onVoteSuccess={handleVoteSuccess}
            />
            <ResultsChart
              pollAddress={selectedPoll.address as `0x${string}`}
              options={selectedPoll.options}
            />
          </div>
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        pollAddress={shareData?.address || ''}
        pollQuestion={shareData?.question || ''}
      />
    </div>
  );
}

