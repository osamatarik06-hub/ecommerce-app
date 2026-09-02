
// Paste your single Paddle Product ID here
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PADDLE_PRODUCT_ID = 'pro_01m1fzwehd7dket943knxkde5a'; // <-- Replace with your real pro_ ID

export async function POST(req: Request) {
  try {
    const { items, shippingAddress } = await req.json();
    const apiKey = process.env.PADDLE_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing PADDLE_API_KEY' }, { status: 500 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Calculate total amount dynamically from the incoming items array
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // 1. Save pending order to Neon database via Prisma
    const dbOrder = await prisma.order.create({
      data: {
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

    // 2. Dynamically map each item's price and name into Paddle's line items payload
    const lineItems = items.map((item: any) => ({
      quantity: item.quantity,
      price: {
        description: item.name,
        product_id: PADDLE_PRODUCT_ID,
        tax_mode: 'external',
        unit_price: {
          currency_code: 'USD',
          amount: Math.round(item.price).toString(), // Pulls the exact dynamic price passed from the frontend
        },
      },
    }));

    // 3. Create Paddle transaction using the dynamic line items
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