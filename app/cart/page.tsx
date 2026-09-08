'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function CartPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const SHIPPING_FEE = 500; // $5.00 flat rate in cents

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  // Coupon state
  const [inputCoupon, setInputCoupon] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

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
            discountPrice: ci.product.discountPrice,
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

    const savedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    setCartItems(savedCart);
  };

  useEffect(() => {
    if (status !== 'loading') {
      loadCart();
    }
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [status, session]);

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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCoupon.trim();
    if (!code) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId: getUserId() }),
      });
      const data = await res.json();

      if (data.success) {
        setDiscountPercent(data.discountPercent);
        setAppliedCode(code.toUpperCase());
        setCouponMessage(data.message);
        sessionStorage.setItem('applied_coupon_id', data.couponId);
      } else {
        setDiscountPercent(0);
        setAppliedCode('');
        setCouponMessage(data.error || 'Invalid coupon code.');
        sessionStorage.removeItem('applied_coupon_id');
      }
    } catch (err) {
      console.error('Coupon error:', err);
      setCouponMessage('Error applying coupon.');
    }
  };

  const subtotalAmount = cartItems.reduce((sum, item) => {
    const hasDiscount = item.discountPrice && item.discountPrice < item.price;
    const effectivePrice = hasDiscount ? item.discountPrice : item.price;
    return sum + (effectivePrice * item.quantity);
  }, 0);

  const discountAmount = Math.round(subtotalAmount * (discountPercent / 100));
  const discountedSubtotal = subtotalAmount - discountAmount;
  const totalAmount = discountedSubtotal + (cartItems.length > 0 ? SHIPPING_FEE : 0);
  
  const subtotalInDollars = (subtotalAmount / 100).toFixed(2);
  const discountInDollars = (discountAmount / 100).toFixed(2);
  const shippingInDollars = (SHIPPING_FEE / 100).toFixed(2);
  const totalInDollars = (totalAmount / 100).toFixed(2);

  const clearUserCart = async () => {
    const userId = getUserId();
    if (userId) {
      for (const item of cartItems) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: item.id, quantity: 0 }),
        }).catch(() => {});
      }
    }
    localStorage.removeItem('cart_items');
    setCartItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      <main className="max-w-3xl mx-auto px-3 sm:px-8 py-4 sm:py-8 space-y-6 flex-grow w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3B2F2F]">Your Shopping Cart</h1>

        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-[#6F4E57]">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => {
              const hasDiscount = item.discountPrice && item.discountPrice < item.price;
              const effectivePrice = hasDiscount ? item.discountPrice : item.price;

              return (
                <div key={item.id} className="border-b border-[#6F4E57]/20 py-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-[#6F4E57]/20 flex-shrink-0" />
                    )}
                    <div className="flex-grow min-w-0">
                      <h2 className="text-sm sm:text-base font-bold text-[#3B2F2F] leading-snug">{item.name}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className={`text-xs font-bold ${hasDiscount ? 'text-red-600' : 'text-[#6F4E57]'}`}>
                          ${(effectivePrice / 100).toFixed(2)} each
                        </p>
                        {hasDiscount && (
                          <p className="text-[10px] text-[#6F4E57]/60 line-through">
                            ${(item.price / 100).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-[#6F4E57]/10">
                    <div className="flex items-center space-x-2">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)} className="bg-[#6F4E57]/25 hover:bg-[#6F4E57]/35 text-[#3B2F2F] px-3 py-1 rounded-lg text-xs font-semibold transition-colors">-</button>
                      <span className="w-6 text-center font-medium text-xs">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)} className="bg-[#6F4E57]/25 hover:bg-[#6F4E57]/35 text-[#3B2F2F] px-3 py-1 rounded-lg text-xs font-semibold transition-colors">+</button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-base sm:text-lg font-extrabold text-[#C07C56]">${((effectivePrice * item.quantity) / 100).toFixed(2)}</span>
                      <button type="button" onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700 text-xs font-semibold uppercase tracking-wider">Remove</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div>
            {status === 'loading' ? (
              <p className="text-[#6F4E57]">Checking authentication status...</p>
            ) : !session ? (
              <div className="bg-white/80 p-4 sm:p-6 rounded-2xl border border-[#6F4E57]/20 shadow-sm text-center space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#3B2F2F]">Sign in to complete your purchase</h2>
                <p className="text-[#6F4E57] text-xs leading-relaxed">You can browse items freely, but you need an account to proceed to checkout.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:space-x-4 pt-2">
                  <Link href="/login" className="bg-[#3B2F2F] text-[#FAF3E0] font-medium py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider hover:bg-[#2c2323] transition-all shadow-md text-center">
                    Sign In
                  </Link>
                  <Link href="/signup" className="border border-[#6F4E57]/30 text-[#3B2F2F] font-medium py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider hover:border-[#6F4E57] transition-all text-center">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-white/80 p-4 sm:p-6 rounded-2xl border border-[#6F4E57]/20 shadow-sm">
                <div className="flex flex-col space-y-2 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#3B2F2F]">Contact & Checkout</h2>
                  <span className="text-[11px] sm:text-xs text-[#6F4E57] bg-[#6F4E57]/10 px-3 py-1.5 rounded-xl border border-[#6F4E57]/30 font-medium break-all w-full">
                    Logged in as {session.user?.email}
                  </span>
                </div>

                {/* Name and Email inputs - Forced single column on mobile */}
                <div className="grid grid-cols-1 gap-3">
                  <input type="text" name="fullName" required placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full bg-white border border-[#6F4E57]/30 rounded-xl p-3 text-[#3B2F2F] placeholder-[#6F4E57]/60 text-sm focus:outline-none focus:border-[#6F4E57]" />
                  <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full bg-white border border-[#6F4E57]/30 rounded-xl p-3 text-[#3B2F2F] placeholder-[#6F4E57]/60 text-sm focus:outline-none focus:border-[#6F4E57]" />
                </div>

                {/* Coupon Code Input Slot */}
                <div className="border-t border-[#6F4E57]/20 pt-4 space-y-2">
                  <label className="text-sm font-bold text-[#3B2F2F] block">Have a coupon code?</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="e.g. SAVE10" 
                      value={inputCoupon} 
                      onChange={(e) => setInputCoupon(e.target.value)} 
                      className="flex-grow bg-white border border-[#6F4E57]/30 rounded-xl p-2.5 text-[#3B2F2F] placeholder-[#6F4E57]/60 text-sm focus:outline-none focus:border-[#6F4E57]" 
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon} 
                      className="bg-[#6F4E57] hover:bg-[#5e4149] text-white font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex-shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs mt-1 ${discountPercent > 0 ? 'text-green-700 font-semibold' : 'text-red-600'}`}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="border-t border-[#6F4E57]/20 pt-4 space-y-3">
                  <label className="text-sm font-bold text-[#3B2F2F] block">Select Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border bg-[#3B2F2F] text-[#FAF3E0] border-[#3B2F2F]"
                    >
                      PayPal / Card
                    </button>
                    
                    <div className="relative group">
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border bg-[#6F4E57]/10 text-[#6F4E57]/40 border-[#6F4E57]/20 cursor-not-allowed"
                      >
                        Cash on Delivery
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-[#3B2F2F] text-[#FAF3E0] text-[10px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg z-50">
                        Unlocks soon
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#6F4E57]/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-[#6F4E57]">
                    <span>Subtotal:</span>
                    <span className="font-mono">${subtotalInDollars}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-green-700 font-medium">
                      <span>Discount ({appliedCode} - {discountPercent}%):</span>
                      <span className="font-mono">-${discountInDollars}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-[#6F4E57]">
                    <span>Shipping (Flat Rate):</span>
                    <span className="font-mono">${shippingInDollars}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#6F4E57]/20">
                    <span className="text-lg sm:text-xl font-bold text-[#3B2F2F]">Total:</span>
                    <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#C07C56]">${totalInDollars}</span>
                  </div>
                </div>

                {/* PayPal Buttons */}
                <div className="pt-2">
                  <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
                    <PayPalButtons 
                      style={{ layout: "vertical" }}
                      createOrder={(data, actions) => {
                        if (!formData.fullName || !formData.email) {
                          alert('Please fill in your name and email before proceeding to PayPal.');
                          throw new Error('Contact details missing');
                        }

                        const nameParts = formData.fullName.trim().split(' ');
                        const givenName = nameParts[0];
                        const surname = nameParts.slice(1).join(' ') || givenName;

                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: {
                              currency_code: "USD",
                              value: totalInDollars,
                              breakdown: {
                                item_total: {
                                  currency_code: "USD",
                                  value: subtotalInDollars
                                },
                                shipping: {
                                  currency_code: "USD",
                                  value: shippingInDollars
                                },
                                ...(discountAmount > 0 && {
                                  discount: {
                                    currency_code: "USD",
                                    value: discountInDollars
                                  }
                                })
                              }
                            }
                          }],
                          payer: {
                            name: {
                              given_name: givenName,
                              surname: surname
                            },
                            email_address: formData.email
                          }
                        });
                      }}
                      onApprove={async (data, actions) => {
                        setLoading(true);
                        try {
                          const details = await actions.order?.capture();
                          
                          const paypalTransactionId = details?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

                          const shippingInfo = details?.purchase_units?.[0]?.shipping;
                          const paypalAddress = {
                            fullName: shippingInfo?.name?.full_name || formData.fullName,
                            email: formData.email,
                            addressLine: shippingInfo?.address?.address_line_1 || '',
                            city: shippingInfo?.address?.admin_area_2 || '',
                            postalCode: shippingInfo?.address?.postal_code || '',
                            countryCode: shippingInfo?.address?.country_code || 'US',
                          };

                          const orderRes = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              items: cartItems,
                              shippingAddress: paypalAddress,
                              userId: getUserId(),
                              paymentMethod: 'paypal',
                              couponUsed: appliedCode,
                              discountAmount,
                              paypalDetails: details,
                              totalAmount,
                              shippingFee: SHIPPING_FEE,
                            }),
                          });

                          const orderData = await orderRes.json();

                          if (orderData.success && orderData.orderId) {
                            sessionStorage.setItem('verified_order_id', orderData.orderId);
                            if (paypalTransactionId) {
                              sessionStorage.setItem('paypal_tx_id', paypalTransactionId);
                            }
                          }

                          await clearUserCart();
                          window.location.href = '/success';
                        } catch (err: any) {
                          alert('Checkout completion error: ' + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}