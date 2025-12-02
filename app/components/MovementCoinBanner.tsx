'use client';

import { useState } from 'react';

export default function MovementCoinBanner() {
  const [showBanner, setShowBanner] = useState(true);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <div 
        className="backdrop-blur-md border border-white/30 rounded-lg p-4 hover:border-white/50 transition-all duration-300 shadow-lg relative banner-glow" 
        style={{ 
          background: 'linear-gradient(to right, rgba(68, 0, 209, 0.9), rgba(131, 23, 113, 0.83))'
        }}
      >
        <button
          onClick={() => setShowBanner(false)}
          className="absolute -top-2 -right-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200 z-10"
          aria-label="Close banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img 
              src="/happy/movemelogo.png" 
              alt="Movement Coin" 
              className="w-16 h-16 object-contain"
            />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full">Hot</span>
          </div>
          <div className="text-center w-full">
            <h3 className="text-white text-lg font-bold font-mono mb-1">Movement Coin</h3>
            <p className="text-zinc-300 text-xs font-mono">The Referral Movement Token is the world's first referral-powered crypto movement, built on transparent, on-chain incentives that grow through community strength-not insiders or manipulation.</p>
          </div>
          <a
            href="https://pancakeswap.finance/swap?outputCurrency=0x35078DB252d16DB8aCca206498b4193a25DE4774"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md transition-colors duration-200 w-full flex items-center justify-center hover:opacity-90"
            style={{ backgroundColor: '#36C3C9' }}
          >
            <img 
              src="/happy/panases.png" 
              alt="Buy on PancakeSwap" 
              className="h-5 w-auto object-contain"
            />
          </a>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(68, 0, 209, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 8px 40px rgba(68, 0, 209, 0.6), 0 4px 20px rgba(204, 46, 178, 0.4), 0 0 30px rgba(68, 0, 209, 0.3);
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }
        
        .banner-glow {
          animation: pulseGlow 3s ease-in-out infinite;
          box-shadow: 0 8px 32px rgba(68, 0, 209, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

