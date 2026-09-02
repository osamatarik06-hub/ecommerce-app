'use client';

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
}

export default function AddToCartButton({ id, name, price }: AddToCartButtonProps) {
  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    const existingIndex = existingCart.findIndex((item: any) => item.id === id);

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem('cart_items', JSON.stringify(existingCart));

    // Dispatch a custom event so the Navbar instantly updates the count badge
    window.dispatchEvent(new Event('cartUpdated'));
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