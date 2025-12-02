'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import Header from '../../components/Header';
import GradientButton from '../../components/GradientButton';
import OutlinedButton from '../../components/OutlinedButton';
import AnalyzeSkeleton from '../../components/AnalyzeSkeleton';
import MovementCoinBanner from '../../components/MovementCoinBanner';

interface AnalysisResult {
  address: string;
  tokenBalance: string;
  tokenBalanceRaw: number;
  totalTransactions: number;
  buys: number;
  sells: number;
  totalBought: string;
  totalSold: string;
  totalBoughtBNB: string;
  totalSoldBNB: string;
  totalBoughtUSD: string;
  totalSoldUSD: string;
  profitLoss: string;
  profitLossUSD: string;
  isProfitable: boolean;
  hasEverSold: boolean;
  jeetScore: number;
  reasons: string[];
  metrics: {
    aht_hours: number;
    ttfs_hours: number;
    sell_ratio_24h: number;
    loss_fraction: number;
    full_dump_fraction: number;
  };
  firstTx: string;
  lastTx: string;
  // DexScreener data
  tokenPrice: string;
  priceChange24h: string;
  volume24h: string;
  liquidity: string;
  marketCap: string;
  marketCapATH: string;
  marketCapAtBuy: string;
  marketCapAtSell: string;
  holdingValue: string;
  tokenSymbol: string;
  tokenName: string;
}

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const shareImageRef = useRef<HTMLDivElement>(null);
  
  // Random image from happy folder
  const happyImages = [
    'aaa.png',
    'degenai.png',
    'edd-eddsworld.png',
    'ff.jpg',
    'G2hItwaXcAAkeVU.jpg',
    'JFF_token_icon_256x256.webp',
    'ss.jpg',
    'unnamed.jpg'
  ];
  const [selectedImage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * happyImages.length);
    return `/happy/${happyImages[randomIndex]}`;
  });


  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analyze?address=${params.address}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analysis');
        }
        
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.address) {
      fetchAnalysis();
    }
  }, [params.address]);

  const getJeetRating = (score: number, hasEverSold: boolean) => {
    // Higher score = more paperhand (inverted from before)
    if (score >= 65) return { text: 'Paperhanded', emoji: '📄' };
    if (score >= 40) return { text: 'Jeet', emoji: '🚨' };
    if (score >= 20) return { text: 'Neutral', emoji: '🤔' };
    // If they've ever sold, show "Balance" instead of "Diamond Hands"
    if (hasEverSold) return { text: 'Balance', emoji: '💰' };
    return { text: 'Diamond Hands', emoji: '💎' };
  };

  const getRatingColor = (score: number, hasEverSold?: boolean) => {
    // If they've ever sold and score is low, show "Balance" in white
    if (hasEverSold && score < 20) {
      return "text-white";
    }
    // Higher score = worse (red), lower = better (yellow/green)
    if (score >= 65) return "text-red-400";
    if (score >= 40) return "text-orange-500";
    if (score >= 20) return "text-white";
    return "text-green-400";
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const generateShareImage = async () => {
    if (!shareImageRef.current || !result || !username.trim()) return;
    
    setIsGenerating(true);
    try {
      // Use client-side html2canvas (free, works on mobile with optimizations)
      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Wait a bit for any images to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(shareImageRef.current, {
        backgroundColor: '#0a0a0a',
        scale: isMobile ? 1.5 : 2, // Lower scale on mobile for better performance
        logging: false,
        useCORS: true, // Allow cross-origin images
        allowTaint: false, // Prevent tainting canvas
        foreignObjectRendering: false, // Better mobile compatibility
        imageTimeout: 15000, // 15 second timeout for images
        removeContainer: true, // Clean up after capture
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded in cloned document
          const clonedElement = clonedDoc.querySelector('[data-html2canvas-ignore="false"]') || 
                                clonedDoc.body.querySelector('div');
          if (clonedElement && clonedElement instanceof HTMLElement) {
            // Force font loading
            clonedElement.style.fontFamily = 'monospace';
          }
        }
      });
      
      const imageUrl = canvas.toDataURL('image/png', 0.95); // Slightly lower quality for mobile
      setGeneratedImageUrl(imageUrl);
      setShowShareModal(false);
      setShowImagePreview(true);
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Failed to generate image. Please try again. If this persists, try on a desktop browser.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl || !result || !username.trim()) return;
    
    const link = document.createElement('a');
    link.download = `pve-${result.tokenSymbol}-${username}.png`;
    link.href = generatedImageUrl;
    link.click();
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

      {/* Header */}
      <Header showInstallButton={true} />

      {loading && !result ? (
        <AnalyzeSkeleton />
      ) : (
      <div className="relative z-10 flex justify-center px-4 pt-28 md:pt-32 pb-8">
        <div className="w-full max-w-4xl">
          {/* Back */}
          <button
            onClick={() => router.push("/")}
            className="mb-3 flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {/* Main card */}
          <div className="rounded-2xl border border-zinc-700/20 bg-zinc-900/10 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.7)] px-4 py-4 md:px-6 md:py-5 space-y-5">
          {/* Token strip / header */}
          <div 
            className="rounded-xl border border-zinc-700/20 backdrop-blur-md px-4 py-3 flex items-center justify-between"
            style={{
              background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
              boxShadow: '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            {result ? (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm md:text-base font-bold font-mono text-white">
                      {result.tokenSymbol || "Token"}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 text-white rounded-full font-medium font-mono" style={{ backgroundColor: 'rgba(16, 0, 55, 0.5)' }}>
                      {result.tokenName || "PVE Token"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm md:text-base font-bold font-mono text-white">
                      ${result.tokenPrice}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        parseFloat(result.priceChange24h) >= 0
                          ? "text-green-400 bg-green-500/20"
                          : "text-red-400 bg-red-500/20"
                      }`}
                    >
                      {parseFloat(result.priceChange24h) >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(result.priceChange24h))}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsRefreshing(true);
                    setLoading(true);
                    setError('');
                    const fetchAnalysis = async () => {
                      try {
                        const response = await fetch(`/api/analyze?address=${params.address}`);
                        const data = await response.json();
                        
                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to fetch analysis');
                        }
                        
                        setResult(data);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'An error occurred');
                      } finally {
                        setLoading(false);
                        setTimeout(() => setIsRefreshing(false), 300);
                      }
                    };
                    fetchAnalysis();
                  }}
                  className="flex flex-col items-center gap-1.5 ml-4 hover:opacity-80 transition-opacity"
                  title="Refresh"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold font-mono text-white">
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
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
                  </div>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold font-mono">
                    Refresh
                  </span>
                </button>
              </>
            ) : (
              <div className="h-6" />
            )}
          </div>

          {/* Center text */}
          <div className="text-center pt-3 pb-2">
            {result && (
              <>
                <div className="mb-3">
                  <p className="text-xl md:text-2xl font-bold font-mono mb-1.5">
                    <span className="text-white">Your</span>{" "}
                    <span className="align-middle text-xl">
                      {getJeetRating(result.jeetScore, result.hasEverSold).emoji}
                    </span>{" "}
                    <span className={`${getRatingColor(result.jeetScore, result.hasEverSold)} font-extrabold font-mono`}>
                      {getJeetRating(result.jeetScore, result.hasEverSold).text}
                    </span>
                  </p>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <p className="text-[10px] text-zinc-500 font-medium font-mono uppercase tracking-wider">
                      Current Balance:
                    </p>
                    <p
                      className="text-3xl md:text-4xl font-black font-mono drop-shadow-lg"
                      style={{
                        background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {result.tokenBalance.split(" ")[0].replace(/,/g, '')}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium font-mono">
                    {result.tokenSymbol}
                  </p>
                </div>
                <p className="text-sm text-zinc-500 font-semibold font-mono">
                  ≈ ${parseFloat(result.holdingValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </>
            )}
          </div>

          {/* PNL Card */}
          {result && (
            <div className="rounded-xl bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 px-3 py-2 text-center max-w-3xl mx-auto mb-2 shadow-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[9px] text-zinc-400 mb-0 tracking-wide uppercase font-semibold font-mono">
                  PNL
                </p>
              </div>
              
              {(() => {
                const hasSells = parseFloat(result.totalSold || '0') > 0;
                const isHolding = !hasSells && parseFloat(result.totalBought || '0') > 0;
                
                if (isHolding) {
                  return (
                    <>
                      <p className="text-lg font-black font-mono text-white mb-0">
                        {result.tokenBalance?.split(" ")[0]?.replace(/,/g, '') || "0"} {result.tokenSymbol}
                      </p>
                      <p className="text-xs font-semibold font-mono text-zinc-400">
                        ≈ ${result.holdingValue ? parseFloat(result.holdingValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
                      </p>
                    </>
                  );
                }
                
                const profitLossUSD = parseFloat(result.profitLossUSD || '0');
                const profitLossPercent = result.totalBoughtUSD && parseFloat(result.totalBoughtUSD) > 0 
                  ? ((profitLossUSD / parseFloat(result.totalBoughtUSD)) * 100).toFixed(2)
                  : '0.00';
                
                return (
                  <>
                    <p className="text-xl font-black font-mono mb-0 text-white">
                      {result.isProfitable ? '+' : ''}${Math.abs(profitLossUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                    <p className="text-sm font-bold font-mono text-zinc-400">
                      {result.isProfitable ? '+' : ''}{profitLossPercent}%
                    </p>
                  </>
                );
              })()}
            </div>
          )}

          {/* 2x2 stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl mx-auto">
            <div className="rounded-xl bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 px-3 py-2 text-center hover:border-zinc-600/40 hover:bg-zinc-900/20 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-[9px] text-zinc-400 mb-0 tracking-wide uppercase font-semibold font-mono">
                  Bought with
                </p>
              </div>
              <p className="text-base font-bold font-mono text-white mb-0">
                {result?.totalBoughtBNB ? parseFloat(result.totalBoughtBNB).toFixed(6) : "0.000000"} BNB
              </p>
              <p className="text-[10px] text-zinc-500 font-medium font-mono">
                ≈ ${result?.totalBoughtUSD ? parseFloat(result.totalBoughtUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 px-3 py-2 text-center hover:border-zinc-600/40 hover:bg-zinc-900/20 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <p className="text-[9px] text-zinc-400 mb-0 tracking-wide uppercase font-semibold font-mono">
                  Sold
                </p>
              </div>
              <p className="text-base font-bold font-mono text-white mb-0">
                {result?.totalSold ?? "0"}{" "}
                <span className="text-xs text-zinc-500 font-mono">{result?.tokenSymbol ?? ""}</span>
              </p>
              <p className="text-xs font-semibold font-mono text-zinc-400 mb-0">
                for {result?.totalSoldBNB ? parseFloat(result.totalSoldBNB).toFixed(6) : "0.000000"} BNB
              </p>
              <p className="text-[10px] text-zinc-500 font-medium font-mono">
                ≈ ${result?.totalSoldUSD ? parseFloat(result.totalSoldUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 px-3 py-2 text-center hover:border-zinc-600/40 hover:bg-zinc-900/20 transition-all duration-300 shadow-lg">
              {(() => {
                const hasSells = result && parseFloat(result.totalSold || '0') > 0;
                const isHolding = result && !hasSells && parseFloat(result.totalBought || '0') > 0;
                
                if (isHolding) {
                  // Show holding value instead of loss
                  return (
                    <>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[9px] mb-0 tracking-wide uppercase font-semibold font-mono text-white">
                          Holding
                        </p>
                      </div>
                      <p className="text-base font-bold font-mono mb-0 text-white">
                        {result?.tokenBalance?.split(" ")[0]?.replace(/,/g, '') || "0"}{" "}
                        <span className="text-xs text-zinc-500 font-mono">{result?.tokenSymbol ?? ""}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium font-mono">
                        ≈ ${result?.holdingValue ? parseFloat(result.holdingValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
                      </p>
                    </>
                  );
                }
                
                // Show profit/loss if there are sells
                const profitLossUSD = parseFloat(result?.profitLossUSD || '0');
                const isActuallyProfitable = profitLossUSD > 0;
                
                return (
                  <>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {isActuallyProfitable ? (
                        <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : (
                        <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                      <p className={`text-[9px] mb-0 tracking-wide uppercase font-semibold font-mono ${
                        isActuallyProfitable ? "text-green-400" : "text-red-400"
                      }`}>
                        {isActuallyProfitable ? "Profit" : "Loss"}
                      </p>
                    </div>
                    <p className={`text-base font-bold font-mono mb-0 ${
                      isActuallyProfitable ? "text-green-400" : "text-red-400"
                    }`}>
                      {isActuallyProfitable ? '+' : ''}${Math.abs(profitLossUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium font-mono">
                      {(() => {
                        const profitLoss = parseFloat(result?.profitLoss || '0');
                        if (Math.abs(profitLoss) < 0.0001) return "0.0000";
                        return `${isActuallyProfitable ? '+' : ''}${Math.abs(profitLoss).toFixed(4)} ${result?.tokenSymbol ?? ""}`;
                      })()}
                    </p>
                  </>
                );
              })()}
            </div>

            <div className="rounded-xl bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 px-3 py-2 text-center hover:border-zinc-600/40 hover:bg-zinc-900/20 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-[9px] text-zinc-400 mb-0 tracking-wide uppercase font-semibold font-mono">
                  Total Trades
                </p>
              </div>
              <p className="text-base font-bold font-mono text-white mb-0">
                {result?.totalTransactions ?? 0}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium font-mono">
                transactions
              </p>
            </div>
          </div>

          {/* Reasons Section */}
          {result && result.reasons && result.reasons.length > 0 && (
            <div className="bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 rounded-full bg-zinc-700"></div>
                <p className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Why {result.jeetScore >= 65 ? 'Paperhanded' : result.jeetScore >= 40 ? 'Jeet' : result.jeetScore >= 20 ? 'Neutral' : (result.hasEverSold ? 'Balance' : 'Diamond Hands')}:
                </p>
              </div>
              <ul className="space-y-2">
                {result.reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm font-mono text-zinc-200 flex items-start gap-2 bg-zinc-900/30 rounded-lg p-2.5 border border-zinc-800/50">
                    <span className="text-lg mt-0.5 text-zinc-500">●</span>
                    <span className="flex-1">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900 mt-2 text-xs">
            <div>
              <p className="text-zinc-600 mb-1">Wallet Address</p>
              {result && (
                <p className="text-zinc-400 font-mono">
                  {result.address.slice(0, 6)}...{result.address.slice(-4)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <OutlinedButton
                text="Checker"
                onClick={() => router.push("/")}
                borderColor="var(--primary-color)"
                icon={
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      stroke="currentColor"
                      strokeWidth={2}
                      fill="none"
                    />
                  </svg>
                }
              />
              <GradientButton
                text="Share"
                onClick={handleShare}
                icon={
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
        </div>
      </div>
      )}

      {error && (
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center text-sm">
          <p className="text-white font-medium mb-1">Error</p>
          <p className="text-zinc-400">{error}</p>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 mt-16 pt-12 pb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-zinc-500 text-sm">Powered by</span>
            <img 
              src="/happy/pve.png" 
              alt="PVE" 
              className="h-5 w-auto object-contain"
            />
            <span className="text-white font-bold">PVE</span>
          </div>
          <div className="flex justify-center gap-4">
            <a href="https://x.com/PVElauncher" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://t.me/pvelauncher" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Share Modal */}
      {showShareModal && result && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900/20 backdrop-blur-md rounded-2xl border border-zinc-700/20 max-w-md w-full shadow-xl overflow-hidden">
            <h3 className="text-xl font-bold font-mono text-white px-6 py-4">
              Create Shareable Image
            </h3>
            <div className="px-6 pb-6">
              <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-2">Enter your username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@degenuser"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono"
                  style={{ fontSize: '16px' }} // Prevent mobile zoom (must be >= 16px)
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <OutlinedButton
                  text="Cancel"
                  onClick={() => {
                    setShowShareModal(false);
                    setUsername('');
                  }}
                  borderColor="var(--primary-color)"
                  className="flex-1"
                />
                <GradientButton
                  text={isGenerating ? 'Generating...' : 'Show'}
                  onClick={generateShareImage}
                  type="button"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && generatedImageUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-700/20 p-4 max-w-2xl w-full shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-mono text-white">Your Shareable Image</h3>
              <button
                onClick={() => {
                  setShowImagePreview(false);
                  setGeneratedImageUrl(null);
                  setUsername('');
                }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-3 rounded-lg overflow-hidden border border-zinc-700/30">
              <img 
                src={generatedImageUrl} 
                alt="Shareable image" 
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
            <div className="flex gap-2">
              <OutlinedButton
                text="Close"
                onClick={() => {
                  setShowImagePreview(false);
                  setGeneratedImageUrl(null);
                  setUsername('');
                }}
                borderColor="var(--primary-color)"
                className="flex-1"
              />
              <GradientButton
                text="Download"
                onClick={downloadImage}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shareable Image (Hidden) */}
      {result && (
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
          <div
            ref={shareImageRef}
            style={{
              width: '1200px',
              height: '675px',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'monospace'
            }}
          >
            {/* Full Background Image */}
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1
            }}>
              <img 
                src={selectedImage}
                alt="Character"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(100%) contrast(1.4) brightness(0.7)',
                  opacity: 1
                }}
              />
            </div>

            {/* Diagonal Split Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom right, transparent 0%, transparent 45%, rgba(10, 10, 10, 0.85) 55%, rgba(10, 10, 10, 0.9) 100%)',
              zIndex: 2,
              clipPath: 'polygon(0 0, 55% 0, 45% 100%, 0 100%)'
            }}></div>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(10, 10, 10, 0.85)',
              zIndex: 2,
              clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 45% 100%)'
            }}></div>

            {/* Diagonal Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 3,
              pointerEvents: 'none'
            }}>
              <svg width="1200" height="675" style={{ position: 'absolute', inset: 0 }}>
                <line 
                  x1="0" 
                  y1="0" 
                  x2="660" 
                  y2="675" 
                  stroke="rgba(255, 255, 255, 0.2)" 
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Right Side - Trading Data */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '600px',
              height: '100%',
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 3
            }}>
              {/* Top Right - Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: 'auto'
              }}>
                <img 
                  src="/happy/pve.png"
                  alt="PVE"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain'
                  }}
                />
                <div>
                  <div style={{
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '32px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1
                  }}>
                    PVE LAUNCHER
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontWeight: 400,
                    marginTop: '4px'
                  }}>
                    ON BNB CHAIN
                  </div>
                </div>
              </div>

              {/* Center Right - Token Info */}
              <div style={{
                marginTop: 'auto',
                marginBottom: 'auto'
              }}>
                <div style={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '48px',
                  marginBottom: '24px',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase'
                }}>
                  {result.tokenSymbol.toUpperCase()}/BNB
                </div>
                {(() => {
                  const currentPrice = parseFloat(result.tokenPrice || '0');
                  const totalBought = parseFloat(result.totalBought || '0');
                  const totalBoughtUSD = parseFloat(result.totalBoughtUSD || '0');
                  const purchasePrice = totalBought > 0 ? totalBoughtUSD / totalBought : 0;
                  const priceChangePercent = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
                  const profitColor = priceChangePercent >= 0 ? '#22c55e' : '#ef4444';
                  
                  // Calculate days held from first transaction
                  let daysHeld = 0;
                  if (result.firstTx && result.firstTx !== 'N/A') {
                    try {
                      // Parse the date string (format: MM/DD/YYYY or locale-specific)
                      const firstTxDate = new Date(result.firstTx);
                      if (!isNaN(firstTxDate.getTime())) {
                        const now = new Date();
                        const diffTime = now.getTime() - firstTxDate.getTime();
                        daysHeld = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                      }
                    } catch (e) {
                      // If parsing fails, default to 0
                      daysHeld = 0;
                    }
                  }
                  
                  return (
                    <>
                      <div style={{
                        fontSize: '96px',
                        fontWeight: 900,
                        color: profitColor,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        marginBottom: '16px'
                      }}>
                        {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '20px',
                        fontWeight: 500,
                        marginTop: '16px'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Held for {daysHeld} {daysHeld === 1 ? 'day' : 'days'}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Bottom Right - Username */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '18px',
                  fontWeight: 500,
                  marginBottom: '8px'
                }}>
                  {username.trim() ? (username.startsWith('@') ? username : `@${username}`) : '@username'}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  https://pvelauncher.com
                </div>
              </div>
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

      {/* Movement Coin Banner Ad - Fixed Bottom Right */}
      <MovementCoinBanner />
    </div>
  );
}
