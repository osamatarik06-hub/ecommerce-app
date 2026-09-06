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
      <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-3xl mx-auto p-8 text-center space-y-4 flex-grow flex flex-col justify-center items-center">
          <div className="bg-white/80 border border-[#6F4E57]/20 rounded-2xl p-8 shadow-sm w-full max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-[#3B2F2F]">Access Denied</h1>
            <p className="text-[#6F4E57] text-xs">Please sign in to view your order history.</p>
            <Link href="/login" className="inline-block bg-[#3B2F2F] text-[#FAF3E0] font-medium py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider hover:bg-[#2c2323] transition-all shadow-md w-full">
              Sign In
            </Link>
          </div>
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
      returns: true, // <--- Added to track return request statuses per order
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto p-8 space-y-6 flex-grow w-full">
        <h1 className="text-3xl font-bold text-[#3B2F2F]">Your Order History</h1>

        {orders.length === 0 ? (
          <div className="bg-white/80 border border-[#6F4E57]/20 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <p className="text-[#6F4E57] text-xs">You haven't placed any orders yet.</p>
            <Link href="/" className="inline-block bg-[#C07C56] hover:bg-[#b06c48] text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md">
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