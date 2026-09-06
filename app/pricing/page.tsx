import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const revalidate = 0;

export default async function PricingPage() {
  const products = await prisma.product.findMany();

  return (
    <div className="min-h-screen bg-[#FAF3E0] font-sans text-[#3B2F2F]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold mb-2 text-[#241B1B]">Pricing & Catalog</h1>
        <p className="text-xs text-[#6F4E57] mb-10">Transparent pricing and high-end tech, accessories, and lifestyle gear available at VELVET.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-[#FFFDF8] border border-[#D8C7B5] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-[#E6C9A8] transition-colors">
              <div>
                <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-xl mb-4 bg-[#FAF3E0]" />
                <h2 className="font-bold text-sm text-[#3B2F2F]">{product.name}</h2>
                <p className="text-xs text-[#6F4E57] mt-2 line-clamp-3">{product.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#D8C7B5]/40">
                <span className="font-extrabold text-base text-[#C07C56]">${(product.price / 100).toFixed(2)}</span>
                <Link href={`/product/${product.id}`} className="bg-[#3B2F2F] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#241B1B] transition-colors">
                  View Item
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}