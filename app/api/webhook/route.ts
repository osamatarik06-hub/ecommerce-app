import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { Paddle } from '@paddle/paddle-node-sdk';

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

    if (eventType === 'transaction.completed') {
      const customData = data.custom_data || data.passthrough || (eventData as any).custom_data || {};
      let orderId = customData.order_id || data.order_id;
      const userId = customData.userId || data.userId;

      const customerEmail = data.customer?.email || customData.email || 'customer@example.com';
      const customerName = data.customer?.name || 'Valued Customer';
      const rawAmount = data.details?.totals?.total || data.total || 0;
      const amount = Number(rawAmount) || 0;
      const lineItems = data.items || data.details?.line_items || [];

      const orderItemsData = [];
      for (const item of lineItems) {
        const prodId = item.product?.id || item.product_id || item.price_id;
        const productName = item.product?.name || item.description || "Custom Product";
        const unitPrice = Number(item.unit_price?.amount || item.price?.unit_price?.amount || 0);

        if (prodId) {
          let product = await prisma.product.findUnique({ where: { id: prodId } });
          
          if (!product) {
            product = await prisma.product.create({
              data: {
                id: prodId,
                name: productName,
                description: item.description || "Imported from Paddle",
                price: unitPrice,
                imageUrl: item.product?.image_url || "https://placehold.co/400"
              }
            });
          }

          orderItemsData.push({
            quantity: item.quantity || 1,
            product: { connect: { id: product.id } }
          });
        }
      }

      let targetOrder = null;

      // 1. Try finding by explicit orderId
      if (orderId) {
        targetOrder = await prisma.order.findUnique({ where: { id: orderId } });
      }

      // 2. Fallback: Find user's most recent pending order
      if (!targetOrder && userId) {
        targetOrder = await prisma.order.findFirst({
          where: { userId: userId, status: { in: ['pending', 'PENDING', 'Pending'] } },
          orderBy: { createdAt: 'desc' }
        });
        if (targetOrder) orderId = targetOrder.id;
      }

      // 3. Fallback: Find by email and pending status
      if (!targetOrder && customerEmail) {
        targetOrder = await prisma.order.findFirst({
          where: { email: customerEmail, status: { in: ['pending', 'PENDING', 'Pending'] } },
          orderBy: { createdAt: 'desc' }
        });
        if (targetOrder) orderId = targetOrder.id;
      }

      if (targetOrder && orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'completed',
            amount: amount,
            email: customerEmail,
            fullName: customerName,
            items: {
              deleteMany: {},
              create: orderItemsData
            }
          }
        });
        console.log(`Webhook successfully updated order ${orderId} to completed.`);
      } else {
        const newOrder = await prisma.order.create({
          data: {
            userId: userId,
            email: customerEmail,
            fullName: customerName,
            amount: amount,
            status: 'completed',
            addressLine: 'N/A',
            city: 'N/A',
            postalCode: 'N/A',
            countryCode: 'US',
            items: orderItemsData.length > 0 ? { create: orderItemsData } : undefined
          }
        });
        orderId = newOrder.id;
        console.log('Webhook created new completed order via fallback.');
      }

      // Send Order Confirmation Email using Resend
      if (customerEmail && customerEmail !== 'customer@example.com') {
        try {
          await resend.emails.send({
            from: 'VELVET <onboarding@resend.dev>', // Change to your verified domain later
            to: [customerEmail],
            subject: `Order Confirmation #${orderId ? orderId.slice(0, 8) : 'VELVET'}`,
            html: `
              <div style="font-family: sans-serif; background: #FAF3E0; color: #3B2F2F; padding: 30px;">
                <h1 style="color: #C07C56;">Thank you for your order, ${customerName}!</h1>
                <p>Your payment has been successfully processed through Paddle.</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Total Amount:</strong> $${(amount / 100).toFixed(2)}</p>
                <p>We are getting your items ready for shipment.</p>
                <br/>
                <p style="font-size: 12px; color: #6F4E57;">VELVET Storefront</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Failed to send confirmation email:', emailErr);
        }
      }

      return NextResponse.json({ success: true, received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Error Details:', error?.message || error);
    return NextResponse.json({ error: 'Webhook handler failed', details: error?.message }, { status: 500 });
  }
}