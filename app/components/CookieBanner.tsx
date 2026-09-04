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
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-4 z-50 text-white animate-fade-in">
      <div className="flex flex-col space-y-3">
        <div className="text-sm text-gray-300">
          We use cookies to enhance your browsing experience and analyze site traffic. Read our{' '}
          <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleConsent('declined')}
            className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="px-4 py-1.5 text-xs font-semibold bg-white text-black hover:bg-gray-200 rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}