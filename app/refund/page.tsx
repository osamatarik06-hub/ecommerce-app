export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-2">Refund & Return Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: September 3, 2026</p>

      <p className="text-gray-300 text-sm mb-6 leading-relaxed">
        We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.
      </p>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Eligibility for Returns</h2>
          <p>To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Refunds</h2>
          <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Shipping Costs for Returns</h2>
          <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
        </section>
      </div>
    </div>
  );
}