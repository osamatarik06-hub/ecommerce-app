import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Navbar from './components/Navbar';
import AddToCartButton from './components/AddToCartButton';

export default async function HomePage() {
  const products = await prisma.product.findMany();

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Featured Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                    unoptimized
                    loading="eager"
                  />
                </div>
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-gray-600 text-sm my-2">{product.description}</p>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">${(product.price / 100).toFixed(2)}</span>
                <AddToCartButton id={product.id} name={product.name} price={product.price} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}