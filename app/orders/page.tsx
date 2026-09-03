import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import Navbar from "../components/Navbar";
import Link from "next/link";
import Image from "next/image";

const prisma = new PrismaClient();

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-3xl mx-auto p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-gray-400">Please sign in to view your order history.</p>
          <Link href="/login" className="inline-block bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200">
            Sign In
          </Link>
        </main>
      </div>
    );
  }

  // Fetch orders and include relational items and product info
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Your Order History</h1>

        {orders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-4">
            <p className="text-gray-400">You haven't placed any orders yet.</p>
            <Link href="/" className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const rawAmount = order.amount ?? 0;
              const formattedPrice = !isNaN(Number(rawAmount)) ? (Number(rawAmount) / 100).toFixed(2) : '0.00';

              return (
                <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                    <div>
                      <p className="text-xs text-gray-400">Order ID</p>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full border uppercase tracking-wider font-semibold ${
                        order.status === 'completed' 
                          ? 'bg-green-950 text-green-400 border-green-800' 
                          : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  {/* Render Ordered Items List with Thumbnails */}
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

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="text-lg font-bold">${formattedPrice}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}