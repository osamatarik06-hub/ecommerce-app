import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const PADDLE_PRODUCT_ID = 'pro_01m1fzwehd7dket943knxkde5a';

export async function POST(req: Request) {
  try {
    const { items, shippingAddress, userId } = await req.json();
    const apiKey = process.env.PADDLE_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing PADDLE_API_KEY' }, { status: 500 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const totalAmount = Math.round(
      items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    );

    // 1. Save pending order to database with the userId and clean integer amount
    const dbOrder = await prisma.order.create({
      data: {
        userId: userId || null,
        email: shippingAddress.email,
        fullName: shippingAddress.fullName,
        addressLine: shippingAddress.addressLine,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        countryCode: shippingAddress.countryCode,
        amount: totalAmount,
        status: 'pending',
      },
    });

    // 2. Send order confirmation email via Resend hardcoded to your sandbox address safely
    try {
      await resend.emails.send({
        from: 'VELVET <onboarding@resend.dev>',
        to: ['osamatarik06@gmail.com'],
        subject: `Order Confirmation #${dbOrder.id.slice(-6)}`,
        html: `
          <div style="font-family: sans-serif; background: #000; color: #fff; padding: 20px; border-radius: 8px;">
            <h2 style="color: #fff;">Thank you for your order, ${shippingAddress.fullName}!</h2>
            <p>We've received your order and it is currently being processed.</p>
            <p><strong>Order ID:</strong> ${dbOrder.id}</p>
            <p><strong>Total Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">We will notify you once your items ship.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // 3. Map line items for Paddle
    const lineItems = items.map((item: any) => ({
      quantity: item.quantity,
      price: {
        description: item.name,
        product_id: PADDLE_PRODUCT_ID,
        tax_mode: 'external',
        unit_price: {
          currency_code: 'USD',
          amount: Math.round(item.price).toString(),
        },
      },
    }));

    // 4. Create Paddle transaction and pass both order_id and userId in custom_data
    const response = await fetch('https://sandbox-api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: lineItems,
        customer: {
          address: {
            country_code: shippingAddress.countryCode,
            postal_code: shippingAddress.postalCode,
            city: shippingAddress.city,
            first_line: shippingAddress.addressLine,
          },
        },
        custom_data: {
          order_id: dbOrder.id,
          userId: userId || '',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paddle API Error:', JSON.stringify(data, null, 2));
      return NextResponse.json({ error: data.error?.detail || 'Failed' }, { status: response.status });
    }

    return NextResponse.json({ transactionId: data.data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}