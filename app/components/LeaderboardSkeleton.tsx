'use client';

export default function LeaderboardSkeleton() {
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
          {/* Table Body Skeleton */}
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr
                key={index}
                className="bg-zinc-900/50 border-b border-zinc-800/50"
              >
                <td className="px-1.5 md:px-4 py-1.5 md:py-3">
                  <div className="h-4 w-8 bg-zinc-700/50 rounded animate-pulse"></div>
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3">
                  <div className="flex items-center gap-0.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-zinc-700/50 rounded animate-pulse"></div>
                    <div className="h-3 md:h-4 w-20 md:w-32 bg-zinc-700/50 rounded animate-pulse"></div>
                  </div>
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3">
                  <div className="flex items-center gap-0.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-zinc-700/50 rounded animate-pulse"></div>
                    <div className="h-3 md:h-4 w-8 bg-zinc-700/50 rounded animate-pulse"></div>
                  </div>
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3">
                  <div className="h-3 md:h-4 w-16 md:w-24 bg-zinc-700/50 rounded animate-pulse"></div>
                </td>
                <td className="px-1.5 md:px-4 py-1.5 md:py-3">
                  <div className="h-6 md:h-8 w-16 md:w-20 bg-zinc-700/50 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

