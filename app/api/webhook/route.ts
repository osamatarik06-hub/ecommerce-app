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

    if (eventType === 'transaction.completed') {
      const customData = data.custom_data || {};
      const orderId = customData.order_id;
      const userId = customData.userId || null;
      
      const customerEmail = data.customer?.email || customData.email || 'customer@example.com';
      const customerName = data.customer?.name || 'Valued Customer';
      const rawAmount = data.details?.totals?.total || data.total || 0;
      const amount = Number(rawAmount) || 0;
      const lineItems = data.items || data.details?.line_items || [];

      // Build safe order items creation array, filtering out undefined product IDs
      const orderItemsData = [];
      for (const item of lineItems) {
        // Look for product id via multiple fallback fields
        const prodId = item.product?.id || item.product_id || item.price_id;

        if (prodId) {
          const productExists = await prisma.product.findUnique({ where: { id: prodId } });
          if (productExists) {
            orderItemsData.push({
              quantity: item.quantity || 1,
              product: { connect: { id: prodId } }
            });
          }
        }
      }

      let savedOrder;
      if (orderId) {
        const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
        if (existingOrder) {
          savedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'completed',
              amount: amount,
              email: customerEmail,
              fullName: customerName,
              items: orderItemsData.length > 0 ? { create: orderItemsData } : undefined
            }
          });
        } else {
          savedOrder = await prisma.order.create({
            data: {
              id: orderId,
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
        }
      } else {
        savedOrder = await prisma.order.create({
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
      }

      return NextResponse.json({ success: true, received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Error Details:', error?.message || error);
    return NextResponse.json({ error: 'Webhook handler failed', details: error?.message }, { status: 500 });
  }
}