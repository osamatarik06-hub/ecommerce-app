'use server';

import { Resend } from 'resend';
import { revalidatePath } from 'next/cache';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAnnouncement(formData: FormData) {
  const recipient = formData.get('recipient') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  try {
    await resend.emails.send({
      from: 'Store Support <onboarding@resend.dev>',
      to: [recipient],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; background: #f4f4f5; padding: 30px; color: #18181b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e4e4e7;">
            <h2 style="margin-top: 0; color: #09090b; font-size: 20px;">${subject}</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #3f3f46;">${message}</p>
            <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 25px 0;" />
            <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 0;">Sent securely from your store admin system.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}