'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  totalTransactions: number;
  profitLoss: string;
  balance?: string;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
}

function getRankBadge(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto w-full">
      <div className="inline-block min-w-full align-middle">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr style={{
              background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
              boxShadow: '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
            }}>
              <th className="px-1.5 md:px-4 py-2 md:py-3 text-left text-white font-bold font-mono text-[10px] md:text-xs uppercase tracking-wider">
                Rank
              </th>
              <th className="px-1.5 md:px-4 py-2 md:py-3 text-left text-white font-bold font-mono text-[10px] md:text-xs uppercase tracking-wider">
                <div className="flex items-center gap-0.5 md:gap-2">
                  <svg className="w-2.5 h-2.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Address</span>
                  <span className="sm:hidden">Addr</span>
                </div>
              </th>
              <th className="px-1.5 md:px-4 py-2 md:py-3 text-left text-white font-bold font-mono text-[10px] md:text-xs uppercase tracking-wider">
                <div className="flex items-center gap-0.5 md:gap-2">
                  <svg className="w-2.5 h-2.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Trades
                </div>
              </th>
              <th className="px-1.5 md:px-4 py-2 md:py-3 text-left text-white font-bold font-mono text-[10px] md:text-xs uppercase tracking-wider">
                Balance
              </th>
              <th className="px-1.5 md:px-4 py-2 md:py-3 text-left text-white font-bold font-mono text-[10px] md:text-xs uppercase tracking-wider">
                <div className="flex items-center gap-0.5 md:gap-2">
                  <svg className="w-2.5 h-2.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="hidden sm:inline">View Tx</span>
                  <span className="sm:hidden">Tx</span>
                </div>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {leaderboard.map((entry) => {
              const fullAddress = entry.address.includes('...') 
                ? entry.address 
                : entry.address;
              const displayAddress = entry.address.includes('...') 
                ? entry.address 
                : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`;
              return (
              <tr
                key={entry.rank}
                className="bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors cursor-pointer border-b border-zinc-800/50"
                onClick={() => router.push(`/analyze/${fullAddress}`)}
              >
                <td className="px-1.5 md:px-4 py-1.5 md:py-3 text-white font-mono text-[10px] md:text-sm">
                  {getRankBadge(entry.rank)}
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3 text-white font-mono text-[10px] md:text-sm">
                  <div className="flex items-center gap-0.5 md:gap-2">
                    <svg className="w-2.5 h-2.5 md:w-4 md:h-4 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate max-w-[60px] md:max-w-none text-[10px] md:text-sm">
                      {displayAddress}
                    </span>
                  </div>
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3 text-white font-mono text-[10px] md:text-sm">
                  <div className="flex items-center gap-0.5 md:gap-2">
                    <svg className="w-2.5 h-2.5 md:w-4 md:h-4 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {entry.totalTransactions}
                  </div>
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3 text-white font-mono text-[10px] md:text-sm">
                  {entry.balance || '0'}
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3 font-mono text-[10px] md:text-sm">
                  <a
                    href={`https://bscscan.com/address/${fullAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] md:text-xs font-bold transition-all duration-300 hover:opacity-80"
                    style={{
                      background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                      boxShadow: '0 2px 8px rgba(68, 0, 209, 0.3)',
                      color: 'white',
                    }}
                  >
                    <span className="hidden sm:inline">View Tx</span>
                    <span className="sm:hidden">Tx</span>
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

