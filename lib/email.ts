import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(email: string, fullName: string, orderId: string, amount: number) {
  try {
    await resend.emails.send({
      from: 'Store <onboarding@resend.dev>', // Use your custom domain later
      to: email,
      subject: `Order Confirmation #${orderId.slice(-6)}`,
      html: `
        <div style="font-family: sans-serif; background: #000; color: #fff; padding: 20px;">
          <h2>Thank you for your order, ${fullName}!</h2>
          <p>We've received your order and it is currently being processed.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total Amount:</strong> $${(amount / 100).toFixed(2)}</p>
          <p>We will notify you once your items ship.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}