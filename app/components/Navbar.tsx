'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    setCartItems(savedCart);
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

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

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <nav className="border-b border-gray-800 p-4 max-w-6xl mx-auto flex justify-between items-center">
      <Link href="/" className="font-bold text-xl">VELVET</Link>
      
      <div className="flex items-center space-x-4">
        {/* User Account Dropdown */}
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
                    onClick={() => signOut()}
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

        {/* Cart Dropdown Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsCartOpen(true)}
          onMouseLeave={() => setIsCartOpen(false)}
        >
          <Link href="/cart" className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-lg text-sm font-semibold inline-block">
            Cart ({totalCount})
          </Link>

          {isCartOpen && (
            <div className="absolute right-0 pt-2 w-80 z-50">
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm border-b border-gray-800 pb-2">Cart Preview</h3>
                
                {cartItems.length === 0 ? (
                  <p className="text-gray-400 text-sm py-2">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-2">
                        <div className="pr-2">
                          <p className="font-medium truncate max-w-[120px]">{item.name}</p>
                          <p className="text-gray-400 text-xs">${(item.price / 100).toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-xs">-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-xs">+</button>
                          <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 text-xs ml-1">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cartItems.length > 0 && (
                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-sm font-semibold">Subtotal:</span>
                    <span className="text-sm font-bold">${(subtotal / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}