'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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
      <Link href="/" className="font-bold text-xl">Velvet Store</Link>
      
      {/* Unified container handling the hover state for both button and dropdown */}
      <div 
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Link href="/cart" className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-lg text-sm font-semibold inline-block">
          Cart ({totalCount})
        </Link>

        {isOpen && (
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
    </nav>
  );
}