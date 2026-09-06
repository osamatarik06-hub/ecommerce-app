import Navbar from '@/app/components/Navbar';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white/90 border border-[#6F4E57]/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3B2F2F] mb-1">Shipping Policy</h1>
            <p className="text-[#6F4E57] text-xs font-medium">Last updated: September 3, 2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed pt-2">
            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">1. Processing Time</h2>
              <p className="text-[#3B2F2F]/80">All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">2. Shipping Rates & Delivery Estimates</h2>
              <p className="text-[#3B2F2F]/80">Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">3. Shipment Confirmation & Order Tracking</h2>
              <p className="text-[#3B2F2F]/80">You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}