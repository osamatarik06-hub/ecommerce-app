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

  const SHIPPING_FEE = 500; // $5.00 flat rate in cents

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    addressLine: '',
    city: '',
    postalCode: '',
    countryCode: 'US',
  });

  const getUserId = () => {
    if (session?.user) {
      return (session.user as any).id || (session.user as any).sub;
    }
    return null;
  };

  const loadCart = async () => {
    const userId = getUserId();
    
    if (userId) {
      try {
        const res = await fetch(`/api/cart?userId=${userId}`);
        const data = await res.json();
        if (data.success && data.items) {
          const formatted = data.items.map((ci: any) => ({
            id: ci.product.id,
            name: ci.product.name,
            price: ci.product.price,
            quantity: ci.quantity,
            imageUrl: ci.product.imageUrl,
          }));
          setCartItems(formatted);
          return;
        }
      } catch (e) {
        console.error('Failed to fetch DB cart', e);
      }
    }

    // Fallback to localStorage for guest users
    const savedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    setCartItems(savedCart);
  };

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
    }).then((paddleInstance) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, []);

  // Reload cart whenever session loads or changes
  useEffect(() => {
    if (status !== 'loading') {
      loadCart();
    }
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [status, session]);

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

  const updateQuantity = async (id: string, delta: number) => {
    let updated = [...cartItems];
    const index = updated.findIndex((item) => item.id === id);
    let newQty = 0;

    if (index > -1) {
      newQty = updated[index].quantity + delta;
      updated[index].quantity = newQty;
      if (newQty <= 0) {
        updated = updated.filter((item) => item.id !== id);
      }
    }

    setCartItems(updated);

    const userId = getUserId();
    if (userId) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: id, quantity: newQty }),
      });
    } else {
      localStorage.setItem('cart_items', JSON.stringify(updated));
    }

    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = async (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);

    const userId = getUserId();
    if (userId) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: id, quantity: 0 }),
      });
    } else {
      localStorage.setItem('cart_items', JSON.stringify(updated));
    }

    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotalAmount + (cartItems.length > 0 ? SHIPPING_FEE : 0);

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
          userId: getUserId(),
          shippingFee: SHIPPING_FEE,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      paddle.Checkout.open({
        transactionId: data.transactionId,
        customData: {
          order_id: data.orderId,
        },
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
                <div className="flex items-center space-x-4">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-gray-400">${(item.price / 100).toFixed(2)} each</p>
                  </div>
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
                  <input type="text" name="postalCode" required placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
                  <input type="text" name="countryCode" required maxLength={2} placeholder="Country (e.g. US)" value={formData.countryCode} onChange={handleChange} className="bg-black border border-gray-700 rounded-lg p-3 text-white uppercase" />
                </div>

                <div className="border-t border-gray-800 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">${(subtotalAmount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping (Flat Rate):</span>
                    <span className="font-mono">${(SHIPPING_FEE / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold font-mono">${(totalAmount / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
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