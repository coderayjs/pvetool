'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';

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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
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

  const getRatingColor = (score: number) => {
    // Higher score = worse (red), lower = better (yellow/green)
    if (score >= 65) return "text-red-400";
    if (score >= 40) return "text-orange-500";
    if (score >= 20) return "text-yellow-400";
    return "text-green-400";
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const generateShareImage = async () => {
    if (!shareImageRef.current || !result || !username.trim()) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(shareImageRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        logging: false,
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImageUrl(imageUrl);
      setShowShareModal(false);
      setShowImagePreview(true);
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Failed to generate image. Please try again.');
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

      {/* Top header bar */}
      <div className="relative z-10 w-full bg-purple-700 py-3 px-4 flex items-center justify-between">
        <p className="text-yellow-300 font-bold font-mono text-sm">
          Track Tokens Powered by PVE Launcher
        </p>
        <div className="flex items-center gap-2">
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="text-yellow-300 hover:text-yellow-100 font-semibold text-xs transition-colors bg-purple-900 px-3 py-1 rounded-md flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Install
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="text-yellow-300 hover:text-yellow-100 font-semibold text-xs transition-colors bg-purple-900 px-4 py-1 rounded-md"
          >
            Get Started →
          </button>
        </div>
      </div>

      <div className="relative z-10 flex justify-center px-4 py-8">
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
          <div className="rounded-xl border border-zinc-700/20 bg-zinc-900/10 backdrop-blur-md px-4 py-3 flex items-center justify-between">
            {result ? (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm md:text-base font-bold font-mono text-white">
                      {result.tokenSymbol || "Token"}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-700/50 text-yellow-300 rounded-full font-medium font-mono">
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
                <div className="flex flex-col items-center gap-1.5 ml-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold font-mono text-white">
                    {result.jeetScore}
                  </div>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold font-mono">
                    Score
                  </span>
                </div>
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
                    <span className="text-white">You</span>{" "}
                    <span className="align-middle text-xl">
                      {getJeetRating(result.jeetScore, result.hasEverSold).emoji}
                    </span>{" "}
                    <span className={`${getRatingColor(result.jeetScore)} font-extrabold font-mono`}>
                      {getJeetRating(result.jeetScore, result.hasEverSold).text}
                    </span>
                  </p>
                </div>
                <div className="mb-1.5">
                  <p
                    className={`text-3xl md:text-4xl font-black font-mono mb-1 ${getRatingColor(
                      result.jeetScore
                    )} drop-shadow-lg`}
                  >
                    {result.tokenBalance.split(" ")[0].replace(/,/g, '')}
                  </p>
                  <p className="text-xs text-zinc-400 font-medium font-mono">
                    {result.tokenSymbol}
                  </p>
                </div>
                <p className="text-sm text-zinc-500 font-semibold font-mono">
                  ${parseFloat(result.holdingValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                        <svg className="w-2.5 h-2.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[9px] mb-0 tracking-wide uppercase font-semibold font-mono text-yellow-400">
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
              <button
                onClick={() => router.push("/")}
                className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
              >
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
                Checker
              </button>
              <button 
                onClick={handleShare}
                className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-semibold flex items-center gap-2 transition-colors"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {loading && !result && (
        <div className="mt-10 flex flex-col items-center justify-center text-sm text-zinc-500">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-600 mb-3" />
          <p>Analyzing wallet...</p>
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
          <p className="text-zinc-500 text-sm mb-4">Powered by <span className="text-yellow-300 font-bold">PVE </span></p>
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

      {/* Share Modal */}
      {showShareModal && result && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900/20 backdrop-blur-md rounded-2xl border border-zinc-700/20 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Create Shareable Image</h3>
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-2">Enter your username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@yourusername"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setUsername('');
                }}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateShareImage}
                disabled={!username.trim() || isGenerating}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-lg transition-colors font-semibold"
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </button>
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
              <button
                onClick={() => {
                  setShowImagePreview(false);
                  setGeneratedImageUrl(null);
                  setUsername('');
                }}
                className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-mono text-sm"
              >
                Close
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors font-semibold font-mono text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
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
              background: 'linear-gradient(to bottom right, #022c22, #064e3b, #022c22)',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'monospace'
            }}
          >
            {/* Jungle Background Pattern */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '80px',
                width: '128px',
                height: '128px',
                backgroundColor: 'rgba(22, 101, 52, 0.2)',
                borderRadius: '50%',
                filter: 'blur(60px)'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '80px',
                right: '160px',
                width: '160px',
                height: '160px',
                backgroundColor: 'rgba(21, 128, 61, 0.2)',
                borderRadius: '50%',
                filter: 'blur(60px)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '33%',
                width: '96px',
                height: '96px',
                backgroundColor: 'rgba(22, 101, 52, 0.2)',
                borderRadius: '50%',
                filter: 'blur(40px)'
              }}></div>
            </div>

            {/* Silhouette Leaves */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '160px',
                height: '160px',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 Q30 30 20 50 Q30 70 50 90 Q70 70 80 50 Q70 30 50 10 Z' fill='%23000000'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                transform: 'rotate(-20deg)',
              }}></div>
              <div style={{
                position: 'absolute',
                top: '80px',
                right: '80px',
                width: '128px',
                height: '128px',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 Q30 30 20 50 Q30 70 50 90 Q70 70 80 50 Q70 30 50 10 Z' fill='%23000000'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                transform: 'rotate(45deg)',
              }}></div>
            </div>

            {/* Left Side - Logo and Branding */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#facc15',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#000000',
                fontSize: '24px',
                border: '4px solid #000000'
              }}>
                🦍
              </div>
              <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '16px', letterSpacing: '-0.025em' }}>@PVETOOL</span>
            </div>

            {/* Center - Large PNL Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '200px',
                fontWeight: 900,
                color: 'rgba(255, 255, 255, 0.1)',
                letterSpacing: '-0.05em',
                textShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}>
                PNL
              </div>
            </div>

            {/* Left Side - Large Image */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 10 }}>
              <img 
                src={selectedImage}
                alt="Character"
                style={{
                  width: '400px',
                  height: '400px',
                  objectFit: 'contain',
                  border: '8px solid #ffffff',
                  borderRadius: '8px',
                  filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.8))'
                }}
              />
            </div>

            {/* Right Side - Token Info */}
            <div style={{ position: 'absolute', top: '64px', right: '48px', textAlign: 'right', zIndex: 10 }}>
              <h2 style={{
                fontSize: '60px',
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: '12px',
                letterSpacing: '-0.025em'
              }}>
                ${result.tokenSymbol}
              </h2>
              <p style={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                BOUGHT AT: ${result.marketCapAtBuy ? parseFloat(result.marketCapAtBuy.replace(/,/g, '') || '0').toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) : parseFloat(result.marketCap.replace(/,/g, '') || '0').toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} MC
              </p>
              <p style={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                SOLD: ${result.marketCapAtSell ? parseFloat(result.marketCapAtSell.replace(/,/g, '') || '0').toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) : parseFloat(result.marketCap.replace(/,/g, '') || '0').toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} MC
              </p>
              <div style={{
                fontSize: '96px',
                fontWeight: 900,
                marginTop: '24px',
                lineHeight: 1,
                color: (() => {
                  const currentPrice = parseFloat(result.tokenPrice || '0');
                  const totalBought = parseFloat(result.totalBought || '0');
                  const totalBoughtUSD = parseFloat(result.totalBoughtUSD || '0');
                  const purchasePrice = totalBought > 0 ? totalBoughtUSD / totalBought : 0;
                  const priceChangePercent = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
                  return priceChangePercent >= 0 ? '#22c55e' : '#ef4444'; // green-500 or red-500
                })()
              }}>
                {(() => {
                  const currentPrice = parseFloat(result.tokenPrice || '0');
                  const totalBought = parseFloat(result.totalBought || '0');
                  const totalBoughtUSD = parseFloat(result.totalBoughtUSD || '0');
                  const purchasePrice = totalBought > 0 ? totalBoughtUSD / totalBought : 0;
                  const priceChangePercent = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
                  return priceChangePercent >= 0 ? `+${Math.round(priceChangePercent)}` : `${Math.round(priceChangePercent)}`;
                })()}%
              </div>
              <p style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginTop: '16px',
                color: (() => {
                  const currentPrice = parseFloat(result.tokenPrice || '0');
                  const totalBought = parseFloat(result.totalBought || '0');
                  const totalBoughtUSD = parseFloat(result.totalBoughtUSD || '0');
                  const totalBoughtBNB = parseFloat(result.totalBoughtBNB || '0');
                  const purchasePrice = totalBought > 0 ? totalBoughtUSD / totalBought : 0;
                  const priceChangePercent = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
                  const bnbProfitLoss = totalBoughtBNB * (priceChangePercent / 100);
                  return bnbProfitLoss >= 0 ? '#22c55e' : '#ef4444'; // green-500 or red-500
                })()
              }}>
                {(() => {
                  const currentPrice = parseFloat(result.tokenPrice || '0');
                  const totalBought = parseFloat(result.totalBought || '0');
                  const totalBoughtUSD = parseFloat(result.totalBoughtUSD || '0');
                  const totalBoughtBNB = parseFloat(result.totalBoughtBNB || '0');
                  const purchasePrice = totalBought > 0 ? totalBoughtUSD / totalBought : 0;
                  const priceChangePercent = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
                  const bnbProfitLoss = totalBoughtBNB * (priceChangePercent / 100);
                  return bnbProfitLoss >= 0 
                    ? `+${bnbProfitLoss.toFixed(6)} BNB`
                    : `${bnbProfitLoss.toFixed(6)} BNB`;
                })()}
              </p>
            </div>

            {/* Bottom Right - Signature */}
            <div style={{
              position: 'absolute',
              bottom: '32px',
              right: '48px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 500
            }}>
              {username.trim() ? (username.startsWith('@') ? username : `@${username}`) : '@username'}
            </div>
            
            {/* Center - Large PNL Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '200px',
                fontWeight: 900,
                color: 'rgba(255, 255, 255, 0.1)',
                letterSpacing: '0.1em',
                textShadow: 'none',
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none'
              }}>
                PNL
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
    </div>
  );
}
