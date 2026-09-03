export default function ContactFAQPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      <h1>Support & Frequently Asked Questions</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Frequently Asked Questions</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <strong>Q: How long does shipping take?</strong>
          <p>A: Orders are processed within 1-3 business days and typically arrive within standard delivery windows displayed at checkout.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Q: What is your return policy?</strong>
          <p>A: We offer a 30-day return policy on all unworn items in their original packaging. Check our footer links for full details.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Q: How do I track my order?</strong>
          <p>A: Once your order ships, you will receive a confirmation email containing your live tracking number.</p>
        </div>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>Have any other questions or need help with an order? Drop us a message below and our team will get back to you within 24 hours.</p>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input type="text" placeholder="Your Name" required style={{ padding: '10px', fontSize: '16px' }} />
          <input type="email" placeholder="Your Email Address" required style={{ padding: '10px', fontSize: '16px' }} />
          <textarea placeholder="How can we help you?" rows={5} required style={{ padding: '10px', fontSize: '16px' }}></textarea>
          <button type="submit" style={{ padding: '12px', background: '#111', color: '#fff', border: 'none', fontSize: '16px', cursor: 'pointer' }}>Send Message</button>
        </form>
      </section>
    </main>
  );
}