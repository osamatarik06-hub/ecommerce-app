'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderListClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [returnReasons, setReturnReasons] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-poll the server every 5 seconds for updates from the admin panel
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleReturnRequest = async (orderId: string, userId: string | null) => {
    const reason = returnReasons[orderId];
    if (!reason) {
      alert("Please provide a reason for the return.");
      return;
    }

    if (!userId) {
      alert("User identification missing for this order.");
      return;
    }

    setLoadingOrderId(orderId);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, userId, reason }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Return request submitted successfully for order ${orderId.slice(0, 8)}`);
        setReturnReasons({ ...returnReasons, [orderId]: "" });
        router.refresh();
      } else {
        alert(data.error || "Failed to submit return request.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium shadow-sm">
          {successMessage}
        </div>
      )}

      {initialOrders.map((order: any) => {
        const rawAmount = order.amount ?? 0;
        const formattedPrice = !isNaN(Number(rawAmount)) ? (Number(rawAmount) / 100).toFixed(2) : '0.00';
        const formattedOrderDate = new Date(order.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const wasUpdated = Boolean(order.trackingNumber);
        const shippingFee = order.shippingFee ?? 0;
        const subtotalAmount = rawAmount - shippingFee;

        // Check if this order already has a return request
        const existingReturn = order.returns && order.returns.length > 0 ? order.returns[0] : null;

        return (
          <div key={order.id} className="bg-white border border-[#6F4E57]/30 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-[#6F4E57]/20 pb-3">
              <div>
                <p className="text-xs text-[#6F4E57]">Order ID</p>
                <p className="font-mono text-sm text-[#3B2F2F]">{order.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {wasUpdated && (
                  <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-semibold animate-pulse">
                    Tracking Updated
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full border uppercase tracking-wider font-semibold ${
                  order.status === 'completed' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : order.status === 'rejected'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {order.status || 'pending'}
                </span>
              </div>
            </div>

            {/* Tracking & Estimated Delivery Box */}
            <div className="bg-[#FAF3E0]/80 border border-[#6F4E57]/20 rounded-xl p-3 text-xs space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#6F4E57]">Tracking Number:</span>
                <span className={`font-mono font-semibold ${order.trackingNumber ? 'text-blue-600' : 'text-[#6F4E57]/60 italic'}`}>
                  {order.trackingNumber || 'Pending assignment'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6F4E57]">Estimated Delivery:</span>
                <span className={`font-medium ${order.estimatedDelivery ? 'text-[#3B2F2F]' : 'text-[#6F4E57]/60 italic'}`}>
                  {order.estimatedDelivery 
                    ? new Date(order.estimatedDelivery).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'To be announced'}
                </span>
              </div>
            </div>

            {/* Render Ordered Items List */}
            <div className="space-y-3 border-b border-[#6F4E57]/20 pb-3">
              <p className="text-xs font-semibold text-[#6F4E57] uppercase tracking-wider">Items Purchased</p>
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      {item.product?.imageUrl ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#6F4E57]/20">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name || 'Product Image'}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0 border border-[#6F4E57]/20 flex items-center justify-center text-xs text-[#6F4E57]/60">
                          Img
                        </div>
                      )}
                      <div>
                        <span className="text-[#3B2F2F] font-medium block">
                          {item.product?.name || 'Product'}
                        </span>
                        <span className="text-[#6F4E57] text-xs">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-[#C07C56] font-mono font-bold">
                      ${((item.product?.price || 0) * item.quantity / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6F4E57]/60 italic">No item details recorded.</p>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-1.5 text-sm pt-1">
              <div className="flex justify-between text-[#6F4E57]">
                <span>Subtotal:</span>
                <span className="font-mono">${(subtotalAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6F4E57]">
                <span>Shipping (Flat Rate):</span>
                <span className="font-mono">
                  {shippingFee > 0 ? `$${(shippingFee / 100).toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#6F4E57]/20 text-[#3B2F2F] font-bold">
                <span>Total Paid:</span>
                <span className="font-mono text-lg text-[#C07C56]">${formattedPrice}</span>
              </div>
            </div>

            {/* Return Request Section (Anti-Spam: Show status if submitted) */}
            <div className="pt-4 border-t border-[#6F4E57]/20 space-y-3">
              <p className="text-xs font-semibold text-[#6F4E57] uppercase tracking-wider">Return Status</p>
              {existingReturn ? (
                <div className="p-3 bg-[#FAF3E0]/80 border border-[#6F4E57]/20 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6F4E57]">Status:</span>
                    <span className="font-bold text-yellow-700 uppercase">{existingReturn.status}</span>
                  </div>
                  <div className="text-[#6F4E57]">
                    <span>Reason: </span>
                    <span className="text-[#3B2F2F] italic">"{existingReturn.reason}"</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Reason for return (e.g., damaged or incorrect item)"
                    value={returnReasons[order.id] || ""}
                    onChange={(e) =>
                      setReturnReasons({ ...returnReasons, [order.id]: e.target.value })
                    }
                    className="w-full bg-white border border-[#6F4E57]/30 rounded-xl px-4 py-2.5 text-[#3B2F2F] placeholder-[#6F4E57]/60 text-xs focus:outline-none focus:border-[#6F4E57]"
                  />
                  <button
                    onClick={() => handleReturnRequest(order.id, order.userId)}
                    disabled={loadingOrderId === order.id}
                    className="px-4 py-2.5 bg-[#6F4E57] hover:bg-[#5b3e47] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {loadingOrderId === order.id ? "Submitting Request..." : "Request Return"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-[#6F4E57]/60 pt-2 border-t border-[#6F4E57]/10">
              <span>Order Date: {formattedOrderDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}