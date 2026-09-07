'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (status: 'accepted' | 'declined') => {
    localStorage.setItem('cookie_consent', status);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 max-w-sm w-full bg-[#3B2F2F] border border-[#D8C7B5] rounded-2xl shadow-2xl p-4 z-[99] text-[#FAF3E0] animate-fade-in">
      <div className="flex flex-col space-y-3">
        <div className="text-xs text-[#FAF3E0]/80 leading-relaxed">
          We use cookies to enhance your browsing experience and analyze site traffic. Read our{' '}
          <Link href="/privacy" className="underline hover:text-white font-medium">Privacy Policy</Link>.
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleConsent('declined')}
            className="px-3 py-1.5 text-xs font-semibold text-[#FAF3E0]/60 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#C07C56] text-white hover:bg-[#d28b65] rounded-xl transition-colors shadow-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}