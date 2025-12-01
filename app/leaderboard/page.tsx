'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  totalTransactions: number;
  profitLoss: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Simulated leaderboard data
    // In production, this would fetch from your backend
    const fetchLeaderboard = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData: LeaderboardEntry[] = [
        { rank: 1, address: '0x742d...4f8a', score: 95, totalTransactions: 150, profitLoss: '+245.5' },
        { rank: 2, address: '0x8b3e...9c2d', score: 88, totalTransactions: 120, profitLoss: '+189.3' },
        { rank: 3, address: '0x4f7a...1b5e', score: 82, totalTransactions: 95, profitLoss: '+156.8' },
        { rank: 4, address: '0x9d2c...7a4f', score: 75, totalTransactions: 80, profitLoss: '+98.2' },
        { rank: 5, address: '0x1e8b...3d6c', score: 71, totalTransactions: 65, profitLoss: '+67.4' },
        { rank: 6, address: '0x6c4a...8f2b', score: 68, totalTransactions: 55, profitLoss: '+45.9' },
        { rank: 7, address: '0x3b9d...5e1a', score: 62, totalTransactions: 48, profitLoss: '+23.5' },
        { rank: 8, address: '0x7f2e...4c9b', score: 58, totalTransactions: 42, profitLoss: '-12.3' },
        { rank: 9, address: '0x5a1c...6d8e', score: 45, totalTransactions: 38, profitLoss: '-28.7' },
        { rank: 10, address: '0x2d9f...1a7c', score: 32, totalTransactions: 30, profitLoss: '-54.2' },
      ];
      
      setLeaderboard(mockData);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
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
      <div className="sticky top-0 z-50 w-full py-3 px-4 flex items-center justify-between" style={{ backgroundColor: '#100037' }}>
        <p className="text-yellow-300 font-bold font-mono text-sm">Track Tokens Powered by PVE Launcher</p>
        <button
          onClick={() => router.push('/')}
          className="text-yellow-300 hover:text-yellow-100 font-semibold text-xs transition-colors px-4 py-1 rounded-md font-mono"
          style={{ backgroundColor: '#100037' }}
        >
          Back →
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-mono mb-2 text-white">Leaderboard</h1>
          <p className="text-zinc-400 text-sm font-mono">
            Top traders
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-600 mb-4"></div>
            <p className="text-zinc-400 font-mono text-sm">Loading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header Row */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-zinc-500 text-xs font-semibold font-mono uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Address</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2">Trades</div>
              <div className="col-span-2">P/L</div>
            </div>

            {/* Leaderboard Entries */}
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 rounded-lg px-3 py-2.5 hover:border-zinc-600/40 hover:bg-zinc-900/20 transition-all duration-300 cursor-pointer shadow-lg"
                onClick={() => router.push(`/analyze/${entry.address}`)}
              >
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Rank */}
                  <div className="col-span-1">
                    <span className="text-base font-bold font-mono text-white">
                      {getRankBadge(entry.rank)}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="col-span-12 md:col-span-5">
                    <p className="font-mono text-white text-sm">{entry.address}</p>
                  </div>

                  {/* Score */}
                  <div className="col-span-4 md:col-span-2">
                    <span className="text-base font-bold font-mono text-white">
                      {entry.score}
                    </span>
                    <span className="text-zinc-500 text-xs ml-1 font-mono">/100</span>
                  </div>

                  {/* Transactions */}
                  <div className="col-span-4 md:col-span-2">
                    <span className="text-white text-sm font-mono">{entry.totalTransactions}</span>
                    <span className="text-zinc-500 text-xs ml-1 font-mono">txs</span>
                  </div>

                  {/* P/L */}
                  <div className="col-span-4 md:col-span-2">
                    <span className={`text-sm font-bold font-mono ${
                      entry.profitLoss.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entry.profitLoss}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner Ads Section */}
        <div className="mt-8 mb-8">
          <div className="bg-zinc-900/20 backdrop-blur-md border border-zinc-700/30 rounded-lg p-6 hover:border-zinc-600/50 transition-all duration-300 shadow-lg">
            <div className="text-center">
              <h3 className="text-white text-lg font-bold font-mono mb-2">Join PVE Launcher</h3>
              <p className="text-zinc-300 text-sm font-mono mb-4">Gives You the Advantage</p>
              <a
                href="https://t.me/pvelauncher"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-yellow-300 hover:bg-yellow-200 text-black font-bold font-mono px-6 py-2.5 rounded-md transition-colors duration-200"
              >
                Join Now
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-zinc-500 text-sm font-mono">Powered by</span>
            <img 
              src="/happy/pve.png" 
              alt="PVE" 
              className="h-5 w-auto object-contain"
            />
            <span className="text-yellow-300 font-bold font-mono">PVE</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://x.com/PVElauncher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-yellow-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a
              href="https://t.me/pvelauncher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-yellow-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

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

      {/* Movement Coin Banner Ad - Fixed Bottom Right */}
      {showBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="backdrop-blur-md border border-yellow-300/30 rounded-lg p-4 hover:border-yellow-300/50 transition-all duration-300 shadow-lg relative" style={{ background: 'linear-gradient(to right, rgba(16, 0, 55, 0.3), rgba(234, 179, 8, 0.2))' }}>
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
    </div>
  );
}

