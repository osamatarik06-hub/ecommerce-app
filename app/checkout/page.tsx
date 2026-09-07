import PayPalCheckout from "@/app/components/paypal-checkout";

export default function CheckoutPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout — VELVET</h1>
      <PayPalCheckout />
    </div>
  );
}