'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrderListClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();

  // Auto-poll the server every 5 seconds for updates from the admin panel
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="space-y-4">
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

        // Only show badge when a tracking number is present
        const wasUpdated = Boolean(order.trackingNumber);
        const shippingFee = order.shippingFee ?? 0;
        const subtotalAmount = rawAmount - shippingFee;

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

            {/* Tracking & Estimated Delivery Box with Exact Time */}
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

            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-800/60">
              <span>Order Date: {formattedOrderDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}