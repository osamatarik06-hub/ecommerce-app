import Navbar from '@/app/components/Navbar';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white/90 border border-[#6F4E57]/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3B2F2F] mb-1">Refund & Return Policy</h1>
            <p className="text-[#6F4E57] text-xs font-medium">Last updated: September 3, 2026</p>
          </div>

          <p className="text-[#3B2F2F]/80 text-sm leading-relaxed border-b border-[#6F4E57]/20 pb-4">
            We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.
          </p>

          <div className="space-y-6 text-sm leading-relaxed">
            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">1. Eligibility for Returns</h2>
              <p className="text-[#3B2F2F]/80">To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">2. Refunds</h2>
              <p className="text-[#3B2F2F]/80">Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">3. Shipping Costs for Returns</h2>
              <p className="text-[#3B2F2F]/80">You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}