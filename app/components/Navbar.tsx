'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const getUserId = () => session?.user ? (session.user as any).id : null;

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
        console.error('Failed to load database cart', e);
      }
    }

    const savedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    setCartItems(savedCart);
  };

  useEffect(() => {
    if (status !== 'loading') {
      loadCart();
    }
  }, [status, session]);

  useEffect(() => {
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
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

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="border-b border-gray-800 p-4 max-w-6xl mx-auto flex justify-between items-center bg-black text-white">
      <Link href="/" className="font-bold text-xl">VELVET</Link>
      
      <div className="flex items-center space-x-4">
        {session ? (
          <div 
            className="relative"
            onMouseEnter={() => setIsUserOpen(true)}
            onMouseLeave={() => setIsUserOpen(false)}
          >
            <div className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-lg text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer text-gray-300">
              <span>Hi, <strong className="text-white">{session.user?.name || session.user?.email}</strong></span>
              <span className="text-xs">▾</span>
            </div>

            {isUserOpen && (
              <div className="absolute right-0 pt-2 w-48 z-50">
                <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-2 space-y-1">
                  <Link href="/orders" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg">
                    My Orders
                  </Link>
                  <button
                    onClick={async () => {
                      localStorage.removeItem('cart_items');
                      setCartItems([]);
                      await signOut({ redirect: false });
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/login" className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg font-semibold inline-block">
              Sign In
            </Link>
            <Link href="/signup" className="bg-white text-black hover:bg-gray-200 py-2 px-4 rounded-lg font-semibold inline-block">
              Register
            </Link>
          </div>
        )}

        <div 
          className="relative"
          onMouseEnter={() => setIsCartOpen(true)}
          onMouseLeave={() => setIsCartOpen(false)}
        >
          <Link href="/cart" className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-lg text-sm font-semibold inline-flex items-center space-x-2">
            <span>Cart ({totalCount})</span>
            <span className="text-xs">▾</span>
          </Link>

          {isCartOpen && (
            <div className="absolute right-0 pt-2 w-80 z-50">
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-4 space-y-3">
                <div className="font-semibold text-sm border-b border-gray-800 pb-2">Cart Preview</div>
                {cartItems.length === 0 ? (
                  <p className="text-gray-400 text-sm py-2 text-center">Your cart is empty.</p>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                          <div className="flex items-center space-x-2 truncate max-w-[130px]">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-cover rounded flex-shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="truncate text-gray-300 font-medium">{item.name}</p>
                              <p className="text-xs text-gray-400">${(item.price / 100).toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 bg-black rounded px-1.5 py-0.5 border border-gray-800">
                              <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-white px-1 text-xs">-</button>
                              <span className="w-3 text-center text-xs">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white px-1 text-xs">+</button>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 text-xs font-bold px-1">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-gray-800">
                      <Link href="/cart" className="block w-full text-center bg-white text-black hover:bg-gray-200 py-2 rounded-lg text-sm font-semibold">
                        View Cart & Checkout
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}