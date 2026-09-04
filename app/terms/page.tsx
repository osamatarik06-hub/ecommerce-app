export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: September 3, 2026</p>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Overview</h2>
          <p>This website is operated by our store team. Throughout the site, the terms “we”, “us” and “our” refer to the store. By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Online Store Terms</h2>
          <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Products and Pricing</h2>
          <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Governing Law</h2>
          <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of our operating region.</p>
        </section>
      </div>
    </div>
  );
}