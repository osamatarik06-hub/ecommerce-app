import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import Navbar from "../components/Navbar";
import Link from "next/link";
import OrderListClient from "./OrderListClient";

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
          <OrderListClient initialOrders={orders} />
        )}
      </main>
    </div>
  );
}