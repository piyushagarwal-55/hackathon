'use client';

import { X, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
  marketUrl: string;
  marketQuestion: string;
  onClose: () => void;
}

export function QRCodeModal({ marketUrl, marketQuestion, onClose }: QRCodeModalProps) {
  const handleDownload = () => {
    try {
      const svg = document.getElementById('qr-code-svg') as unknown as SVGElement;
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 512;
      canvas.height = 512;

      img.onload = () => {
        if (!ctx) return;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 512, 512);
        
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `repvote-market-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('QR code downloaded!');
        });
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-scale-in print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 print:border-slate-300">
          <h3 className="text-lg font-bold text-white">Share QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={marketUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Market Info */}
          <div className="space-y-2 print:text-black">
            <p className="text-sm text-slate-400 print:text-slate-600">Market Question:</p>
            <p className="text-base font-medium text-white print:text-black line-clamp-3">
              {marketQuestion}
            </p>
          </div>

          {/* URL */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 print:border-slate-300">
            <p className="text-xs text-slate-400 print:text-slate-600 break-all">
              {marketUrl}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold transition-all"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-all"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

