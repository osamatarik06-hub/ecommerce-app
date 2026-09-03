import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDirectMessage({ to, subject, message }: { to: string; subject: string; message: string }) {
  try {
    const data = await resend.emails.send({
      from: 'VELVET Support <onboarding@resend.dev>', // Update to your custom domain once verified
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; color: #333; padding: 20px;">
          <h2>VELVET Announcement / Support</h2>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">You are receiving this direct message from VELVET store system.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}