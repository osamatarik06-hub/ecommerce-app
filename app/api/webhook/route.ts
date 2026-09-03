import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { Paddle } from '@paddle/paddle-node-sdk';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const paddle = new Paddle(process.env.PADDLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const signature = headerList.get('Paddle-Signature');
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET || '';

    const rawBody = await request.text();
    let eventData;

    try {
      eventData = await paddle.webhooks.unmarshal(rawBody, secretKey, signature || '');
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err?.message);
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    const eventType = eventData.eventType;
    const data: any = eventData.data;

    // Debug log to inspect incoming custom_data in Vercel logs
    console.log('Incoming Webhook Event:', eventType);
    console.log('Incoming custom_data:', JSON.stringify(data.custom_data));

    if (eventType === 'transaction.completed') {
      const customerEmail = data.customer?.email || data.billing_details?.email || 'delivered@resend.dev';
      const customerName = data.customer?.name || data.customer_name || 'Valued Customer';
      
      const rawAmount = data.details?.totals?.total || data.total || 0;
      const parsedAmount = typeof rawAmount === 'string' ? parseInt(rawAmount, 10) : Number(rawAmount);
      const amount = isNaN(parsedAmount) ? undefined : parsedAmount;
      
      const address = data.address || data.billing_address || {};
      
      // Look up order ID across all possible locations in Paddle v2 payload
      const customData = data.custom_data || data.checkout?.custom_data || {};
      const orderId = customData.order_id || customData.orderId || data.passthrough;
      const userId = customData.userId || customData.user_id || null;

      let savedOrder;

      if (orderId) {
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (existingOrder) {
          savedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'completed',
              amount: amount ?? existingOrder.amount,
              addressLine: address.line1 || address.street || undefined,
              city: address.city || undefined,
              countryCode: address.country_code || address.country || undefined,
              postalCode: address.postal_code || address.postalCode || address.zip ? String(address.postal_code || address.postalCode || address.zip) : undefined,
            },
          });
        } else {
          // Fallback: if ID in custom_data didn't match an existing row, find the most recent pending order or create one
          const latestPending = await prisma.order.findFirst({
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' }
          });

          if (latestPending) {
            savedOrder = await prisma.order.update({
              where: { id: latestPending.id },
              data: { status: 'completed', amount: amount ?? latestPending.amount }
            });
          } else {
            savedOrder = await prisma.order.create({
              data: {
                id: orderId,
                userId: userId,
                email: customerEmail,
                fullName: customerName,
                amount: amount || 0,
                status: 'completed',
                addressLine: address.line1 || 'N/A',
                city: address.city || 'N/A',
                countryCode: address.country_code || 'US',
                postalCode: 'N/A',
              },
            });
          }
        }
      } else {
        // Ultimate fallback if no custom data order_id is found at all: update the latest pending order
        const latestPending = await prisma.order.findFirst({
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' }
        });

        if (latestPending) {
          savedOrder = await prisma.order.update({
            where: { id: latestPending.id },
            data: { status: 'completed', amount: amount ?? latestPending.amount }
          });
        } else {
          savedOrder = await prisma.order.create({
            data: {
              userId: userId,
              email: customerEmail,
              fullName: customerName,
              amount: amount || 0,
              status: 'completed',
              addressLine: address.line1 || 'N/A',
              city: address.city || 'N/A',
              countryCode: address.country_code || 'US',
              postalCode: 'N/A',
            },
          });
        }
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