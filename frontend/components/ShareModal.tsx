'use client';

import { useState } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollAddress: string;
  pollQuestion: string;
}

export function ShareModal({ isOpen, onClose, pollAddress, pollQuestion }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/vote/${pollAddress}?q=${encodeURIComponent(pollQuestion)}`
    : '';

  const shareMessage = `Vote on: ${pollQuestion}\n\n${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Share this Poll</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poll Preview */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-400 mb-2">Poll Question</p>
          <p className="text-white font-semibold">{pollQuestion}</p>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            {pollAddress.slice(0, 6)}...{pollAddress.slice(-4)}
          </p>
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <label className="text-sm text-slate-400 mb-2 block">Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-400">Share on social media</p>
          
          {/* WhatsApp */}
          <button
            onClick={shareOnWhatsApp}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Share on WhatsApp
          </button>

          {/* Twitter/X */}
          <button
            onClick={shareOnTwitter}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on Twitter
          </button>
        </div>

        {/* Preview Area */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Link Preview</p>
          <div className="bg-gradient-to-br from-blue-900/30 to-black border border-slate-700/50 rounded-lg p-6 text-center">
            <div className="text-slate-500 text-sm mb-2">RepVote</div>
            <div className="text-white font-bold text-lg mb-1">Governance Poll</div>
            <div className="text-emerald-400 text-xs">✅ Verified Sybil Resistant</div>
          </div>
        </div>
      </div>
    </div>
  );
}
