export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-2">Shipping Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: September 3, 2026</p>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Processing Time</h2>
          <p>All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Shipping Rates & Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Shipment Confirmation & Order Tracking</h2>
          <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).</p>
        </section>
      </div>
    </div>
  );
}