'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;
    
    setIsLoading(true);
    // Navigate to results page
    router.push(`/analyze/${walletAddress}`);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute bottom-0 left-0 overflow-hidden pointer-events-none bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url(/happy/nn.png)',
          backgroundPosition: 'bottom left',
          backgroundSize: 'contain',
          width: '300px',
          height: '300px',
        }}
      ></div>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
      </div>

      {/* Top Banner */}
      <div className="relative z-10 w-full bg-purple-700 py-3 px-4 flex items-center justify-between">
        <p className="text-yellow-300 font-bold font-mono text-sm">Track Tokens Powered by PVE Launcher</p>
        <div className="flex items-center gap-2">
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="text-yellow-300 hover:text-yellow-400 font-bold text-sm transition-colors bg-purple-900 px-4 py-1 rounded flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Install App
            </button>
          )}
          <button className="text-yellow-300 hover:text-yellow-400 font-bold text-sm transition-colors bg-purple-900 px-4 py-1 rounded">
            Get Started →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-8">
        {/* Logo */}
        <div className="mb-6">
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">PVE Tool</h1>
              <span className="inline-block bg-purple-700 border border-yellow-300/30 text-yellow-300 text-xs px-3 py-1 rounded-full font-bold">BETA</span>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-sm md:text-base font-bold font-mono text-center mb-8 text-black bg-white rounded-md px-2.5 py-1 inline-block animate-jeet-subtle hover:scale-105 transition-all duration-300 cursor-pointer">
          Let's see how well you hold your tokens
        </h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full max-w-lg mb-8 px-4 md:px-0">
          <div className="flex items-center gap-2 md:gap-4 bg-zinc-900/20 backdrop-blur-md rounded-lg p-1.5 md:p-2 border border-zinc-700/30 shadow-lg">
            <div className="flex-1 flex items-center gap-1.5 md:gap-2 px-2 md:px-3">
              <svg 
                className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter BNB wallet address"
                className="flex-1 bg-transparent outline-none text-white placeholder-zinc-400 font-mono text-xs md:text-sm min-w-0"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !walletAddress.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-purple-900 font-bold px-3 py-2 md:px-6 md:py-3 rounded-md transition-colors flex items-center gap-1.5 md:gap-2 text-xs md:text-sm flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching
                </>
              ) : (
                <>
                  Search
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Description */}
        <div className="text-center mb-6">
          <p className="text-zinc-400 text-base md:text-lg">
            Meme driven market madness. Who&apos;s the<br />ultimate jeet?
          </p>
        </div>

        {/* Leaderboard Button */}
        <button
          onClick={() => router.push('/leaderboard')}
          className="border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300/10 px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          Check Leaderboard
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 pt-32 md:pt-64 pb-8">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-4">Powered by <span className="text-yellow-300 font-bold">PVE</span></p>
          <div className="flex justify-center gap-4">
            <a href="https://x.com/PVElauncher" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-yellow-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://t.me/pvelauncher" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-yellow-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Movement Coin Banner Ad - Fixed Bottom Right */}
      {showBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="bg-gradient-to-r from-purple-600/30 to-yellow-500/20 backdrop-blur-md border border-yellow-300/30 rounded-lg p-4 hover:border-yellow-300/50 transition-all duration-300 shadow-lg relative">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute -top-2 -right-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200"
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
        </div>
      )}

      <style jsx>{`
        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 50px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 10px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 5s ease-in-out infinite;
          opacity: 0.5;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
