'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  showInstallButton?: boolean;
  rightContent?: React.ReactNode;
}

export default function Header({
  showBackButton = false,
  backButtonText = 'Back →',
  backButtonHref,
  showInstallButton = false,
  rightContent,
}: HeaderProps) {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(showInstallButton);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    if (showInstallButton) {
      // Listen for the beforeinstallprompt event (Android/Desktop)
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstall(true);
      };

      window.addEventListener('beforeinstallprompt', handler);

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstall(false);
      } else if (isIOSDevice) {
        // Show install button for iOS (they need to use Safari share menu)
        setShowInstall(true);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
  }, [showInstallButton]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, show instructions
      alert('To install this app on your iPhone:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleBackClick = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full py-4 md:py-5 px-4 md:px-6 flex items-center justify-between" style={{ backgroundColor: 'rgba(6, 0, 22, 0.78)' }}>
      <div className="flex items-center gap-3 flex-1">
        <img 
          src="/happy/pve.png" 
          alt="PVE" 
          className="h-8 w-8 md:h-10 md:w-10 object-contain"
        />
        <p className="text-white font-bold font-mono text-sm md:text-base">Track Your Bags</p>
      </div>
      <div className="flex items-center gap-2 flex-1 justify-end">
        {rightContent ? (
          rightContent
        ) : showBackButton ? (
          <button
            onClick={handleBackClick}
            className="text-white font-semibold text-xs md:text-sm transition-all duration-300 px-4 py-2 rounded-md font-mono"
            style={{
              background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
              boxShadow: '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.boxShadow = '0 8px 30px rgba(68, 0, 209, 0.5), 0 4px 15px rgba(54, 195, 201, 0.4), 0 0 60px rgba(68, 0, 209, 0.3)';
              target.style.filter = 'brightness(1.15)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.boxShadow = '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)';
              target.style.filter = 'brightness(1)';
            }}
          >
            {backButtonText}
          </button>
        ) : showInstall && showInstallButton ? (
          <button
            onClick={handleInstallClick}
            className="text-white font-bold text-sm md:text-base transition-all duration-300 px-4 py-2 md:py-2.5 rounded flex items-center gap-2"
            style={{
              background: 'transparent',
              border: '2px solid var(--primary-color)',
              boxShadow: '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background = 'linear-gradient(to right, var(--primary-color), var(--secondary-color))';
              target.style.boxShadow = '0 8px 30px rgba(68, 0, 209, 0.5), 0 4px 15px rgba(54, 195, 201, 0.4), 0 0 60px rgba(68, 0, 209, 0.3)';
              target.style.filter = 'brightness(1.15)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background = 'transparent';
              target.style.boxShadow = '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)';
              target.style.filter = 'brightness(1)';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Install App
          </button>
        ) : null}
      </div>
    </div>
  );
}

