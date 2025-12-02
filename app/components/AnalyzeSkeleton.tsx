'use client';

export default function AnalyzeSkeleton() {
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

      <div className="relative z-10 container mx-auto px-4 pt-28 md:pt-32 pb-8 max-w-4xl">
        {/* Loading Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border border-zinc-700/30 bg-zinc-900/20 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            <p className="text-white font-mono text-sm md:text-base">Analyzing wallet...</p>
          </div>
        </div>

        {/* Main card skeleton */}
        <div className="rounded-2xl border border-zinc-700/20 bg-zinc-900/10 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.7)] px-4 py-4 md:px-6 md:py-5 space-y-5">
          {/* Token strip skeleton */}
          <div 
            className="rounded-xl border border-zinc-700/20 backdrop-blur-md px-4 py-3 flex items-center justify-between"
            style={{
              background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
              boxShadow: '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-20 bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-white/20 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 bg-white/20 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 ml-4">
              <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
              <div className="h-2 w-8 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Center text skeleton */}
          <div className="text-center pt-3 pb-2">
            <div className="mb-3">
              <div className="h-6 w-48 mx-auto bg-white/10 rounded animate-pulse mb-2"></div>
            </div>
            <div className="mb-1.5">
              <div className="h-12 w-32 mx-auto bg-white/10 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-16 mx-auto bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-24 mx-auto bg-white/10 rounded animate-pulse"></div>
          </div>

          {/* PNL Card skeleton */}
          <div className="rounded-xl bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 px-3 py-2 text-center max-w-3xl mx-auto mb-2 shadow-lg">
            <div className="h-3 w-12 mx-auto bg-white/10 rounded animate-pulse mb-2"></div>
            <div className="h-6 w-32 mx-auto bg-white/10 rounded animate-pulse"></div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-zinc-900/10 backdrop-blur-md border border-zinc-700/20 px-3 py-2.5">
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-20 bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-3 justify-end pt-2">
            <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse"></div>
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
    </div>
  );
}

