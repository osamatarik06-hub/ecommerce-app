import Navbar from '@/app/components/Navbar';

export default function ContactFAQPage() {
  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-[#3B2F2F] mb-2">Support & Frequently Asked Questions</h1>
          <p className="text-[#6F4E57] text-sm">Find answers below or send us a direct message.</p>
        </div>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#3B2F2F] border-b border-[#6F4E57]/20 pb-2">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-white/90 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-1 shadow-sm">
              <strong className="text-sm font-semibold text-[#3B2F2F] block">Q: How long does shipping take?</strong>
              <p className="text-sm text-[#3B2F2F]/80">A: Orders are processed within 1-3 business days and typically arrive within standard delivery windows displayed at checkout.</p>
            </div>

            <div className="bg-white/90 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-1 shadow-sm">
              <strong className="text-sm font-semibold text-[#3B2F2F] block">Q: What is your return policy?</strong>
              <p className="text-sm text-[#3B2F2F]/80">A: We offer a 30-day return policy on all unworn items in their original packaging. Check our footer links for full details.</p>
            </div>

            <div className="bg-white/90 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-1 shadow-sm">
              <strong className="text-sm font-semibold text-[#3B2F2F] block">Q: How do I track my order?</strong>
              <p className="text-sm text-[#3B2F2F]/80">A: Once your order ships, you will receive a confirmation email containing your live tracking number.</p>
            </div>
          </div>
        </section>

        {/* Distinct Contact Box */}
        <section className="bg-white border-2 border-[#6F4E57]/40 rounded-3xl p-8 shadow-md space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#3B2F2F]">Contact Us</h2>
            <p className="text-xs text-[#6F4E57] mt-1">Have any other questions or need help with an order? Drop us a message below and our team will get back to you within 24 hours.</p>
          </div>
          
          <form className="flex flex-col gap-4 pt-2">
            <input 
              type="text" 
              placeholder="Your Name" 
              required 
              className="bg-[#FAF3E0]/50 border border-[#6F4E57]/30 rounded-xl px-4 py-3 text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]" 
            />
            <input 
              type="email" 
              placeholder="Your Email Address" 
              required 
              className="bg-[#FAF3E0]/50 border border-[#6F4E57]/30 rounded-xl px-4 py-3 text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]" 
            />
            <textarea 
              placeholder="How can we help you?" 
              rows={5} 
              required 
              className="bg-[#FAF3E0]/50 border border-[#6F4E57]/30 rounded-xl px-4 py-3 text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]"
            ></textarea>
            <button 
              type="submit" 
              className="py-3 px-6 bg-[#6F4E57] hover:bg-[#5b3e47] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm self-start cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}