import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { Paddle } from '@paddle/paddle-node';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const paddle = new Paddle(process.env.PADDLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const signature = headerList.get('Paddle-Signature');
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET || '';

    // 1. Read raw text so cryptographic signature validation matches
    const rawBody = await request.text();

    let eventData;

    try {
      // 2. Verify signature using Paddle SDK (Fixes the 401 Error)
      eventData = paddle.webhooks.unmarshal(rawBody, secretKey, signature || '');
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err?.message);
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    const eventType = eventData.eventType;
    const data: any = eventData.data;

    if (eventType === 'transaction.completed') {
      const customerEmail = data.customer?.email || data.billing_details?.email || 'delivered@resend.dev';
      const customerName = data.customer?.name || data.customer_name || 'Valued Customer';
      
      const rawAmount = data.details?.totals?.total || data.total || 0;
      const parsedAmount = typeof rawAmount === 'string' ? parseInt(rawAmount, 10) : Number(rawAmount);
      const amount = isNaN(parsedAmount) ? undefined : parsedAmount;
      
      const address = data.address || data.billing_address || {};
      const customData = data.custom_data || {};
      const orderId = customData.order_id;
      const userId = customData.userId || null;

      let savedOrder;

      if (orderId) {
        savedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            userId: userId || undefined,
            status: 'completed',
            amount: amount,
            addressLine: address.line1 || address.street || undefined,
            city: address.city || undefined,
            countryCode: address.country_code || address.country || undefined,
            postalCode: address.postal_code || address.postalCode || address.zip ? String(address.postal_code || address.postalCode || address.zip) : undefined,
          },
        });
      } else {
        savedOrder = await prisma.order.create({
          data: {
            userId: userId,
            email: customerEmail,
            fullName: customerName,
            amount: amount || 0,
            status: 'completed',
            addressLine: address.line1 || address.street || 'N/A',
            city: address.city || 'N/A',
            countryCode: address.country_code || address.country || 'US',
            postalCode: String(address.postal_code || address.postalCode || address.zip || 'N/A'),
          },
        });
      }

      try {
        await resend.emails.send({
          from: 'VELVET Support <onboarding@resend.dev>',
          to: ['osamatarik06@gmail.com'],
          subject: 'Order Confirmed - Thank You!',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #18181b;">
              <h2>Thank you for your order, ${customerName}!</h2>
              <p>We have successfully received your payment. Your order ID is <strong>${savedOrder.id}</strong>.</p>
              <p>We are getting your items ready for fulfillment.</p>
            </div>
          `,
        });
      } catch (emailError: any) {
        console.error('Non-blocking Resend Error:', emailError?.message || emailError);
      }

      return NextResponse.json({ success: true, received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}