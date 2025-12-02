'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import LeaderboardTable from '../components/LeaderboardTable';
import LeaderboardSkeleton from '../components/LeaderboardSkeleton';
import GradientButton from '../components/GradientButton';
import MovementCoinBanner from '../components/MovementCoinBanner';

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  totalTransactions: number;
  profitLoss: string;
  balance?: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [tokenInfo, setTokenInfo] = useState<{ symbol: string; name: string; address: string } | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Leaderboard API response:', data);
        
        if (data.error) {
          console.error('API returned error:', data.error);
          setLeaderboard([]);
        } else {
          if (data.leaderboard && Array.isArray(data.leaderboard)) {
            console.log('Setting leaderboard data:', data.leaderboard.length, 'entries');
            setLeaderboard(data.leaderboard);
          } else {
            console.warn('Unexpected data format:', data);
            setLeaderboard([]);
          }
          
          if (data.tokenInfo) {
            setTokenInfo(data.tokenInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);


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

      {/* Header */}
      <Header showBackButton={true} />

      <div className="relative z-10 container mx-auto px-4 pt-28 md:pt-32 pb-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-2xl md:text-3xl font-bold font-mono mb-2"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f8f8f8 50%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            PVE Leaderboard
          </h1>
          <p className="text-zinc-400 text-sm font-mono mb-3">
            Top traders
          </p>
          
          {/* Token Info */}
          {tokenInfo && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700/30 bg-zinc-900/20 backdrop-blur-sm">
                <span className="text-white font-bold font-mono text-sm md:text-base">
                  {tokenInfo.symbol}
                </span>
                <span className="text-zinc-400 font-mono text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16, 0, 55, 0.5)' }}>
                  {tokenInfo.name}
                </span>
              </div>
              <a
                href={`https://bscscan.com/address/${tokenInfo.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white font-mono text-xs transition-colors flex items-center gap-1"
              >
                <span className="truncate max-w-[200px] md:max-w-none">
                  {tokenInfo.address.slice(0, 6)}...{tokenInfo.address.slice(-4)}
                </span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {loading ? (
          <LeaderboardSkeleton />
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-zinc-400 font-mono text-sm">No leaderboard data available</p>
          </div>
        ) : (
          <>
            <LeaderboardTable 
              leaderboard={leaderboard.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
            />
            {leaderboard.length > itemsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md font-mono text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={{
                    background: currentPage === 1 
                      ? 'rgba(16, 0, 55, 0.5)' 
                      : 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                    boxShadow: currentPage === 1 
                      ? 'none' 
                      : '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      const target = e.currentTarget as HTMLElement;
                      target.style.boxShadow = '0 8px 30px rgba(68, 0, 209, 0.5), 0 4px 15px rgba(54, 195, 201, 0.4), 0 0 60px rgba(68, 0, 209, 0.3)';
                      target.style.filter = 'brightness(1.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      const target = e.currentTarget as HTMLElement;
                      target.style.boxShadow = '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)';
                      target.style.filter = 'brightness(1)';
                    }
                  }}
                >
                  Previous
                </button>
                <span className="text-white font-mono text-sm px-4">
                  Page {currentPage} of {Math.ceil(leaderboard.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(leaderboard.length / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(leaderboard.length / itemsPerPage)}
                  className="px-4 py-2 rounded-md font-mono text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={{
                    background: currentPage >= Math.ceil(leaderboard.length / itemsPerPage)
                      ? 'rgba(16, 0, 55, 0.5)' 
                      : 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                    boxShadow: currentPage >= Math.ceil(leaderboard.length / itemsPerPage)
                      ? 'none' 
                      : '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage < Math.ceil(leaderboard.length / itemsPerPage)) {
                      const target = e.currentTarget as HTMLElement;
                      target.style.boxShadow = '0 8px 30px rgba(68, 0, 209, 0.5), 0 4px 15px rgba(54, 195, 201, 0.4), 0 0 60px rgba(68, 0, 209, 0.3)';
                      target.style.filter = 'brightness(1.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < Math.ceil(leaderboard.length / itemsPerPage)) {
                      const target = e.currentTarget as HTMLElement;
                      target.style.boxShadow = '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)';
                      target.style.filter = 'brightness(1)';
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Banner Ads Section */}
        <div className="mt-8 mb-8">
          <div 
            className="backdrop-blur-md border border-zinc-700/30 rounded-lg p-6 hover:border-zinc-600/50 transition-all duration-300 shadow-lg relative overflow-hidden"
            style={{
              backgroundImage: 'url(/bgim.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
            <div className="text-center relative z-10">
              <h3 className="text-white text-lg font-bold font-mono mb-2">Join PVE Launcher</h3>
              <p className="text-zinc-300 text-sm font-mono mb-4">Gives You the Advantage</p>
              <GradientButton
                text="JOIN US"
                href="https://t.me/pvelauncher"
                target="_blank"
                rel="noopener noreferrer"
              />
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
            <span className="text-white font-bold font-mono">PVE</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://x.com/PVElauncher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a
              href="https://t.me/pvelauncher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
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
      <MovementCoinBanner />
      {/* Old banner code removed - using component now */}
      {false && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="backdrop-blur-md border border-white/30 rounded-lg p-4 hover:border-white/50 transition-all duration-300 shadow-lg relative" style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))' }}>
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

