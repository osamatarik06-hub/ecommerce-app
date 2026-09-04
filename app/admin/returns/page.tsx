import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import AdminReturnsClient from "./AdminReturnsClient";

const prisma = new PrismaClient();

export default async function AdminReturnsPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_session");
  const storedPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!adminCookie || adminCookie.value !== storedPassword) {
    return (
      <div className="min-h-screen bg-black text-white p-8 text-center space-y-4 font-sans">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-400">Please enter your store password to access controls.</p>
        <Link href="/admin" className="inline-block bg-white text-black font-medium py-2 px-6 rounded-lg">
          Back to Admin
        </Link>
      </div>
    );
  }

  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold">Customer Return Requests</h1>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-white underline">
          &larr; Back to Admin Dashboard
        </Link>
      </div>

      <AdminReturnsClient initialReturns={returns} />
    </div>
  );
}