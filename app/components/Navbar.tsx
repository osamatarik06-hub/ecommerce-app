'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

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
            discountPrice: ci.product.discountPrice,
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
    <nav className="w-full bg-[#3B2F2F] border-b border-[#6F4E57]/30 text-[#FAF3E0] sticky top-0 z-50 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-extrabold text-xl tracking-wider text-[#FAF3E0]">VELVET</Link>
        
        <div className="flex items-center space-x-3">
          
          {/* LANGUAGE SELECTOR DROPDOWN */}
          <div 
            className="relative"
            onMouseEnter={() => setIsLangOpen(true)}
            onMouseLeave={() => setIsLangOpen(false)}
          >
            <button className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 text-[#FAF3E0] transition-all">
              <span>🌐 {currentLang}</span>
              <span className="text-[10px]">▾</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 pt-2 w-28 z-50">
                <div className="bg-[#3B2F2F] border border-[#6F4E57]/40 rounded-xl shadow-xl p-1.5 space-y-1">
                  <button onClick={() => { setCurrentLang('EN'); setIsLangOpen(false); }} className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${currentLang === 'EN' ? 'bg-[#C07C56] text-white font-bold' : 'text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30'}`}>
                    English (EN)
                  </button>
                  <button onClick={() => { setCurrentLang('AR'); setIsLangOpen(false); }} className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${currentLang === 'AR' ? 'bg-[#C07C56] text-white font-bold' : 'text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30'}`}>
                    العربية (AR)
                  </button>
                  <button onClick={() => { setCurrentLang('ES'); setIsLangOpen(false); }} className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${currentLang === 'ES' ? 'bg-[#C07C56] text-white font-bold' : 'text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30'}`}>
                    Español (ES)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* USER AUTH */}
          {session ? (
            <div 
              className="relative"
              onMouseEnter={() => setIsUserOpen(true)}
              onMouseLeave={() => setIsUserOpen(false)}
            >
              <div className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 py-2 px-4 rounded-xl text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer text-[#FAF3E0]">
                <span>Hi, <strong className="text-white">{session.user?.name || session.user?.email}</strong></span>
                <span className="text-xs">▾</span>
              </div>

              {isUserOpen && (
                <div className="absolute right-0 pt-2 w-48 z-50">
                  <div className="bg-[#3B2F2F] border border-[#6F4E57]/40 rounded-xl shadow-xl p-2 space-y-1">
                    <Link href="/orders" className="block px-3 py-2 text-sm text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30 hover:text-white rounded-lg">
                      My Orders
                    </Link>
                    <button
                      onClick={async () => {
                        localStorage.removeItem('cart_items');
                        setCartItems([]);
                        await signOut({ redirect: false });
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-[#6F4E57]/30 hover:text-red-200 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/login" className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 text-[#FAF3E0] py-2 px-4 rounded-xl font-semibold inline-block transition-all">
                Sign In
              </Link>
              <Link href="/signup" className="bg-[#C07C56] hover:bg-[#b06c48] text-white py-2 px-4 rounded-xl font-semibold inline-block transition-all shadow-sm">
                Register
              </Link>
            </div>
          )}

          {/* CART DRAWER */}
          <div 
            className="relative"
            onMouseEnter={() => setIsCartOpen(true)}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <Link href="/cart" className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 py-2 px-4 rounded-xl text-sm font-semibold inline-flex items-center space-x-2 text-[#FAF3E0] transition-all">
              <span>Cart ({totalCount})</span>
              <span className="text-xs">▾</span>
            </Link>

            {isCartOpen && (
              <div className="absolute right-0 pt-2 w-80 z-50">
                <div className="bg-[#3B2F2F] border border-[#6F4E57]/40 rounded-xl shadow-xl p-4 space-y-3">
                  <div className="font-semibold text-sm border-b border-[#6F4E57]/30 pb-2 text-[#FAF3E0]">Cart Preview</div>
                  {cartItems.length === 0 ? (
                    <p className="text-[#FAF3E0]/60 text-sm py-2 text-center">Your cart is empty.</p>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                        {cartItems.map((item) => {
                          const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                          const effectivePrice = hasDiscount ? item.discountPrice : item.price;

                          return (
                            <div key={item.id} className="flex justify-between items-center text-sm border-b border-[#6F4E57]/20 pb-2">
                              <div className="flex items-center space-x-2 truncate max-w-[140px]">
                                {item.imageUrl && (
                                  <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-cover rounded-lg border border-[#6F4E57]/30 flex-shrink-0" />
                                )}
                                <div className="truncate">
                                  <p className="truncate text-[#FAF3E0] font-medium">{item.name}</p>
                                  <div className="flex items-center gap-1.5">
                                    <p className={`text-xs font-bold ${hasDiscount ? 'text-red-400' : 'text-[#C07C56]'}`}>
                                      ${(effectivePrice / 100).toFixed(2)}
                                    </p>
                                    {hasDiscount && (
                                      <p className="text-[10px] text-[#FAF3E0]/50 line-through">
                                        ${(item.price / 100).toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 bg-[#2c2323] rounded-lg px-1.5 py-0.5 border border-[#6F4E57]/30">
                                  <button onClick={() => updateQuantity(item.id, -1)} className="text-[#FAF3E0]/70 hover:text-white px-1 text-xs">-</button>
                                  <span className="w-4 text-center text-xs text-[#FAF3E0]">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, 1)} className="text-[#FAF3E0]/70 hover:text-white px-1 text-xs">+</button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 text-xs font-bold px-1">✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-2 border-t border-[#6F4E57]/30">
                        <Link href="/cart" className="block w-full text-center bg-[#C07C56] hover:bg-[#b06c48] text-white py-2 rounded-xl text-sm font-semibold transition-all shadow-sm">
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
      </div>
    </nav>
  );
}