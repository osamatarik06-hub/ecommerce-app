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
    <div className="space-y-4">
      {successMessage && (
        <div className="p-4 bg-green-950/80 border border-green-800 text-green-300 rounded-xl text-sm font-medium">
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
          <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <p className="text-xs text-gray-400">Order ID</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {wasUpdated && (
                  <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] px-2 py-0.5 rounded-full font-semibold animate-pulse">
                    Tracking Updated
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full border uppercase tracking-wider font-semibold ${
                  order.status === 'completed' 
                    ? 'bg-green-950 text-green-400 border-green-800' 
                    : order.status === 'rejected'
                    ? 'bg-red-950 text-red-400 border-red-800'
                    : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                }`}>
                  {order.status || 'pending'}
                </span>
              </div>
            </div>

            {/* Tracking & Estimated Delivery Box */}
            <div className="bg-black/40 border border-gray-800 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tracking Number:</span>
                <span className={`font-mono font-semibold ${order.trackingNumber ? 'text-blue-400' : 'text-gray-500 italic'}`}>
                  {order.trackingNumber || 'Pending assignment'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Estimated Delivery:</span>
                <span className={`font-medium ${order.estimatedDelivery ? 'text-gray-200' : 'text-gray-500 italic'}`}>
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
            <div className="space-y-3 border-b border-gray-800 pb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items Purchased</p>
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      {item.product?.imageUrl ? (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name || 'Product Image'}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-800 shrink-0 border border-gray-700 flex items-center justify-center text-xs text-gray-500">
                          Img
                        </div>
                      )}
                      <div>
                        <span className="text-gray-200 font-medium block">
                          {item.product?.name || 'Product'}
                        </span>
                        <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-gray-300 font-mono">
                      ${((item.product?.price || 0) * item.quantity / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No item details recorded.</p>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-1.5 text-sm pt-1">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span className="font-mono">${(subtotalAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping (Flat Rate):</span>
                <span className="font-mono">
                  {shippingFee > 0 ? `$${(shippingFee / 100).toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-white font-bold">
                <span>Total Paid:</span>
                <span className="font-mono text-lg">${formattedPrice}</span>
              </div>
            </div>

            {/* Return Request Section (Anti-Spam: Show status if submitted) */}
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Return Status</p>
              {existingReturn ? (
                <div className="p-3 bg-black/60 border border-gray-800 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-bold text-yellow-400 uppercase">{existingReturn.status}</span>
                  </div>
                  <div className="text-gray-400">
                    <span>Reason: </span>
                    <span className="text-gray-200 italic">"{existingReturn.reason}"</span>
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
                    className="w-full bg-black/60 border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gray-600"
                  />
                  <button
                    onClick={() => handleReturnRequest(order.id, order.userId)}
                    disabled={loadingOrderId === order.id}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingOrderId === order.id ? "Submitting Request..." : "Request Return"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-800/60">
              <span>Order Date: {formattedOrderDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}