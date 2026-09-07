'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function SuccessPage() {
  useEffect(() => {
    // Clear the local cart items and update the navbar badge count
    localStorage.removeItem('cart_items');
    window.dispatchEvent(new Event('cartUpdated'));

    // Retrieve the secure order ID, coupon ID, and PayPal transaction ID saved during checkout
    const orderId = sessionStorage.getItem('verified_order_id');
    const couponId = sessionStorage.getItem('applied_coupon_id');
    const paypalTransactionId = sessionStorage.getItem('paypal_tx_id'); // <--- 1. Grab PayPal Transaction ID

    // If someone visits /success manually without going through checkout, stop here!
    if (!orderId) {
      console.warn('No verified order found in session storage.');
      return;
    }

    // Trigger completion strictly for this exact verified order ID and send the PayPal Transaction ID
    fetch('/api/orders/complete-latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, couponId, paypalTransactionId }), // <--- 2. Sent in request body
    })
      .then(res => res.json())
      .then(data => {
        console.log('Order update result:', data);
        // Clean up session storage so it can't be reused
        sessionStorage.removeItem('verified_order_id');
        sessionStorage.removeItem('applied_coupon_id');
        sessionStorage.removeItem('paypal_tx_id'); // <--- 3. Clean up PayPal TX storage as well
      })
      .catch(err => console.error('Fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col font-sans">
      <Navbar />
      <main className="max-w-md mx-auto p-8 flex-grow flex flex-col justify-center items-center w-full">
        <div className="bg-white/80 border border-[#6F4E57]/20 rounded-2xl p-8 text-center space-y-6 shadow-sm w-full">
          <h1 className="text-3xl font-bold text-[#3B2F2F]">Payment Successful!</h1>
          <p className="text-[#6F4E57] text-xs leading-relaxed">
            Thank you for your order. We have received your payment and are getting your items ready for shipment.
          </p>
          
          <div className="flex flex-col space-y-3 pt-2">
            <Link
              href="/orders"
              className="bg-[#3B2F2F] text-[#FAF3E0] font-medium py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider hover:bg-[#2c2323] transition-all shadow-md w-full block text-center"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="bg-[#C07C56] hover:bg-[#b06c48] text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md w-full block text-center"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}