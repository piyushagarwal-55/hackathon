'use client';

import { useState } from 'react';
import { Share2, Twitter, Copy, QrCode, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeModal } from './QRCodeModal';

interface ShareButtonProps {
  marketQuestion: string;
  marketAddress: string;
  currentOdds?: { yes: number; no: number };
  compact?: boolean;
}

export function ShareButton({ marketQuestion, marketAddress, currentOdds, compact = false }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const marketUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?market=${marketAddress}`
    : '';

  const shareText = currentOdds
    ? `I just voted on "${marketQuestion}" on @RepVote! Current odds: ${currentOdds.yes}% YES / ${currentOdds.no}% NO. Vote now: ${marketUrl}`
    : `Check out this prediction market on @RepVote: "${marketQuestion}" ${marketUrl}`;

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setShowMenu(false);
    toast.success('Opening Twitter...');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(marketUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RepVote Market',
          text: shareText,
          url: marketUrl,
        });
        setShowMenu(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    }
  };

  const handleQRCode = () => {
    setShowQRModal(true);
    setShowMenu(false);
  };

  if (compact) {
    return (
      <>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          title="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
        {showQRModal && (
          <QRCodeModal
            marketUrl={marketUrl}
            marketQuestion={marketQuestion}
            onClose={() => setShowQRModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-all border border-slate-700/50"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share</span>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-scale-in">
              <div className="py-1">
                <button
                  onClick={handleTwitterShare}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                >
                  <Twitter className="w-4 h-4 text-sky-400" />
                  <span className="text-sm">Share on Twitter</span>
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleQRCode}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-sm">QR Code</span>
                </button>

                {navigator.share && (
                  <>
                    <div className="border-t border-slate-700 my-1" />
                    <button
                      onClick={handleWebShare}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">More Options...</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showQRModal && (
        <QRCodeModal
          marketUrl={marketUrl}
          marketQuestion={marketQuestion}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </>
  );
}

