'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  useEffect(() => {
    // Clear the local cart items and update the navbar badge count
    localStorage.removeItem('cart_items');
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
        <p className="text-gray-400">
          Thank you for your order. We have received your payment and are getting your items ready for shipment.
        </p>
        
        <div className="flex flex-col space-y-3 pt-2">
          <Link
            href="/orders"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full block text-center"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full block text-center"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </main>
  );
}