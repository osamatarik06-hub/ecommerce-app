'use client';

import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function CartPage() {
  const { data: session, status } = useSession();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    addressLine: '',
    city: '',
    postalCode: '',
    countryCode: 'US',
  });

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart_items');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
  };

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
    }).then((paddleInstance) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });

    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  // Pre-fill user details safely using optional chaining
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user?.name || prev.fullName,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  const updateQuantity = (id: string, delta: number) => {
    let updated = [...cartItems];
    const index = updated.findIndex((item) => item.id === id);
    if (index > -1) {
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        updated = updated.filter((item) => item.id !== id);
      }
    }
    setCartItems(updated);
    localStorage.setItem('cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paddle) return alert('Paddle is still loading...');
    if (cartItems.length === 0) return alert('Your cart is empty.');

    setLoading(true);

    try {
      const res = await fetch('/api/paddle-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress: formData,
          userId: session?.user ? (session.user as any).id : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      paddle.Checkout.open({
        transactionId: data.transactionId,
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          successUrl: `${window.location.origin}/success`,
        },
      });
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>

        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-400">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="border-b border-gray-800 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-400">${(item.price / 100).toFixed(2)} each</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm">-</button>
                    <span className="w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm">+</button>
                  </div>
                  <span className="text-xl font-bold w-24 text-right">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div>
            {status === 'loading' ? (
              <p className="text-gray-400">Checking authentication status...</p>
            ) : !session ? (
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center space-y-4">
                <h2 className="text-xl font-semibold">Sign in to complete your purchase</h2>
                <p className="text-gray-400 text-sm">You can browse items freely, but you need an account to proceed to checkout.</p>
                <div className="flex justify-center space-x-4 pt-2">
                  <Link href="/login" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200">
                    Sign In
                  </Link>
                  <Link href="/signup" className="border border-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-800">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Shipping Information</h2>
                  <span className="text-xs text-green-400 bg-green-950 px-2.5 py-1 rounded-full border border-green-800">Logged in as {session.user?.email}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="fullName" required placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
                  <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
                </div>

                <input type="text" name="addressLine" required placeholder="Street Address" value={formData.addressLine} onChange={handleChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" />

                <div className="grid grid-cols-3 gap-4">
                  <input type="text" name="city" required placeholder="City" value={formData.city} onChange={handleChange} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
                  <input type="text" name="postalCode" required placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className="bg-black border border-gray-700 rounded-lg p-3 code text-white" />
                  <input type="text" name="countryCode" required maxLength={2} placeholder="Country (e.g. US)" value={formData.countryCode} onChange={handleChange} className="bg-black border border-gray-700 rounded-lg p-3 text-white uppercase" />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                  <span className="text-2xl font-bold">Subtotal: ${(totalAmount / 100).toFixed(2)}</span>
                  <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg">
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}