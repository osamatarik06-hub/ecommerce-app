'use client';

import { useSession } from 'next-auth/react';

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
}

export default function AddToCartButton({ id, name, price }: AddToCartButtonProps) {
  const { data: session } = useSession();

  const handleAddToCart = () => {
    const userId = session?.user ? (session.user as any).id : null;

    // 1. Instant UI update across components with product payload
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { id, name, price } }));

    if (!userId) {
      // Guest path: LocalStorage
      const saved = JSON.parse(localStorage.getItem('cart_items') || '[]');
      const index = saved.findIndex((item: any) => item.id === id);
      if (index > -1) saved[index].quantity += 1;
      else saved.push({ id, name, price, quantity: 1 });
      localStorage.setItem('cart_items', JSON.stringify(saved));
    } else {
      // User path: Background fire-and-forget POST
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: id, increment: true }),
      }).catch((err) => console.error('Background sync failed', err));
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Add to Cart
    </button>
  );
}