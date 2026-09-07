'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

// Helper function to read cookie value client-side
function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  // Sidebar Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile Settings Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState({ text: '', isError: false });
  const [isUpdating, setIsUpdating] = useState(false);

  // Read saved language from cookie on mount and update layout direction
  useEffect(() => {
    const savedLocale = getCookie('NEXT_LOCALE');
    if (savedLocale) {
      const upperLocale = savedLocale.toUpperCase();
      setCurrentLang(upperLocale);
      document.documentElement.dir = upperLocale === 'AR' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLocale;
    }
  }, []);

  // Sync profile state when session becomes available or modal opens
  useEffect(() => {
    if (session?.user?.name && isProfileModalOpen && !newName) {
      setNewName(session.user.name);
    }
  }, [session, isProfileModalOpen]);

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

  const changeLanguage = (langCode: string) => {
    const lowerLang = langCode.toLowerCase();
    setCurrentLang(langCode);
    setIsLangOpen(false);
    document.cookie = `NEXT_LOCALE=${lowerLang}; path=/; max-age=31536000`;
    document.documentElement.dir = lowerLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lowerLang;
    window.location.reload();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setProfileMessage({ text: '', isError: false });

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          name: newName,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfileMessage({ text: 'Profile updated successfully!', isError: false });
      
      await update({
        ...session,
        user: {
          ...session?.user,
          name: newName,
        },
      });

      setTimeout(() => {
        setIsProfileModalOpen(false);
        setProfileMessage({ text: '', isError: false });
        setCurrentPassword('');
        setNewPassword('');
      }, 1500);
    } catch (err: any) {
      setProfileMessage({ text: err.message, isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="w-full bg-[#3B2F2F] border-b border-[#6F4E57]/30 text-[#FAF3E0] sticky top-0 z-50 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* LEFT: Hamburger Menu Button + Logo */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 p-2 rounded-xl text-xs font-bold inline-flex items-center justify-center text-[#FAF3E0] transition-all"
              aria-label="Open Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="font-extrabold text-xl tracking-wider text-[#FAF3E0]">VELVET</Link>
          </div>
          
          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            
            {/* LANGUAGE SELECTOR DROPDOWN */}
            <div 
              className="relative"
              onMouseEnter={() => setIsLangOpen(true)}
              onMouseLeave={() => setIsLangOpen(false)}
            >
              <button className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[#FAF3E0] transition-all">
                <span>🌐 {currentLang}</span>
                <span className="text-[10px]">▾</span>
              </button>

              {isLangOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 pt-2 w-28 z-50">
                  <div className="bg-[#3B2F2F] border border-[#6F4E57]/40 rounded-xl shadow-xl p-1.5 space-y-1">
                    <button 
                      onClick={() => changeLanguage('EN')} 
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs rounded-lg transition-colors ${currentLang === 'EN' ? 'bg-[#C07C56] text-white font-bold' : 'text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30'}`}
                    >
                      English (EN)
                    </button>

                    <button 
                      onClick={() => changeLanguage('AR')} 
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs rounded-lg transition-colors ${currentLang === 'AR' ? 'bg-[#C07C56] text-white font-bold' : 'text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30'}`}
                    >
                      العربية (AR)
                    </button>

                    <button 
                      onClick={() => changeLanguage('ES')} 
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs rounded-lg transition-colors ${currentLang === 'ES' ? 'bg-[#C07C56] text-white font-bold' : 'text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30'}`}
                    >
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
                <div className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 py-2 px-4 rounded-xl text-sm font-semibold inline-flex items-center space-x-2 rtl:space-x-reverse cursor-pointer text-[#FAF3E0]">
                  <span>Hi, <strong className="text-white">{session.user?.name || session.user?.email}</strong></span>
                  <span className="text-xs">▾</span>
                </div>

                {isUserOpen && (
                  <div className="absolute ltr:right-0 rtl:left-0 pt-2 w-48 z-50">
                    <div className="bg-[#3B2F2F] border border-[#6F4E57]/40 rounded-xl shadow-xl p-2 space-y-1">
                      <Link href="/orders" className="block px-3 py-2 text-sm text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30 hover:text-white rounded-lg">
                        My Orders
                      </Link>
                      
                      <button
                        onClick={() => {
                          setNewName(session.user?.name || '');
                          setIsUserOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left rtl:text-right px-3 py-2 text-sm text-[#FAF3E0]/80 hover:bg-[#6F4E57]/30 hover:text-white rounded-lg"
                      >
                        Profile Settings
                      </button>

                      <button
                        onClick={async () => {
                          localStorage.removeItem('cart_items');
                          setCartItems([]);
                          await signOut({ redirect: false });
                          window.location.href = '/';
                        }}
                        className="w-full text-left rtl:text-right px-3 py-2 text-sm text-red-300 hover:bg-[#6F4E57]/30 hover:text-red-200 rounded-lg"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
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
              <Link href="/cart" className="bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 border border-[#6F4E57]/40 py-2 px-4 rounded-xl text-sm font-semibold inline-flex items-center space-x-2 rtl:space-x-reverse text-[#FAF3E0] transition-all">
                <span>Cart ({totalCount})</span>
                <span className="text-xs">▾</span>
              </Link>

              {isCartOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 pt-2 w-80 z-50">
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
                                <div className="flex items-center space-x-2 rtl:space-x-reverse truncate max-w-[140px]">
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
                                
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <div className="flex items-center space-x-1 rtl:space-x-reverse bg-[#2c2323] rounded-lg px-1.5 py-0.5 border border-[#6F4E57]/30">
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

      {/* SWIPEABLE SIDEBAR DRAWER (CATEGORIES & PRODUCTS) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-full bg-[#3B2F2F] border-r rtl:border-r-0 rtl:border-l border-[#6F4E57]/40 text-[#FAF3E0] h-full shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-in-out">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#6F4E57]/30">
              <span className="font-extrabold text-lg tracking-wider text-white">VELVET Menu</span>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-[#FAF3E0]/70 hover:text-white text-base font-bold p-1 rounded-lg hover:bg-[#6F4E57]/30 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Categories Section */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#C07C56] font-bold mb-3">Categories</h4>
                <div className="space-y-1">
                  <a 
                    href="#categories-section" 
                    onClick={() => {
                      setIsSidebarOpen(false);
                      const el = document.getElementById('categories-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block px-3 py-2 text-sm rounded-xl text-[#FAF3E0]/90 hover:bg-[#6F4E57]/30 hover:text-white transition-colors cursor-pointer"
                  >
                     Browse Categories
                  </a>
                  <a 
                    href="#products-section" 
                    onClick={() => {
                      setIsSidebarOpen(false);
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block px-3 py-2 text-sm rounded-xl text-[#FAF3E0]/90 hover:bg-[#6F4E57]/30 hover:text-white transition-colors cursor-pointer"
                  >
                     View All Products
                  </a>
                </div>
              </div>

              {/* Products Section */}
              <div className="border-t border-[#6F4E57]/30 pt-4">
                <h4 className="text-xs uppercase tracking-widest text-[#C07C56] font-bold mb-3">Products</h4>
                <div className="space-y-1">
                  
                  <Link 
                    href="/cart" 
                    onClick={() => setIsSidebarOpen(false)}
                    className="block px-3 py-2 text-sm rounded-xl text-[#FAF3E0]/90 hover:bg-[#6F4E57]/30 hover:text-white transition-colors"
                  >
                    🛒 View Cart
                  </Link>
                  {session && (
                    <Link 
                      href="/orders" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="block px-3 py-2 text-sm rounded-xl text-[#FAF3E0]/90 hover:bg-[#6F4E57]/30 hover:text-white transition-colors"
                    >
                      📦 Order History
                    </Link>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#6F4E57]/30 text-center">
              <p className="text-[11px] text-[#FAF3E0]/50">© 2026 VELVET. All rights reserved.</p>
            </div>

          </div>
        </div>
      )}

      {/* PROFILE SETTINGS MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#3B2F2F] border border-[#6F4E57]/40 rounded-2xl shadow-2xl max-w-md w-full p-6 text-[#FAF3E0] relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-[#6F4E57]/30">
              <h3 className="font-bold text-lg text-white">Profile Settings</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-[#FAF3E0]/60 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
              {profileMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${profileMessage.isError ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                  {profileMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#FAF3E0]/80 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-[#2c2323] border border-[#6F4E57]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C07C56]"
                />
              </div>

              <div className="pt-2 border-t border-[#6F4E57]/20">
                <p className="text-xs text-[#FAF3E0]/60 mb-2">Leave password fields blank if you don't wish to change it.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#FAF3E0]/80 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#2c2323] border border-[#6F4E57]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C07C56]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#FAF3E0]/80 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#2c2323] border border-[#6F4E57]/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C07C56]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-[#6F4E57]/30 hover:bg-[#6F4E57]/50 rounded-xl text-[#FAF3E0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#C07C56] hover:bg-[#b06c48] text-white rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}