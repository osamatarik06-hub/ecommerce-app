import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, userId, totalAmount } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    // Create the order mapping strictly to existing schema fields
    const newOrder = await prisma.order.create({
      data: {
        userId,
        email: shippingAddress?.email || '',
        fullName: shippingAddress?.fullName || '',
        addressLine: shippingAddress?.addressLine || '',
        city: shippingAddress?.city || '',
        postalCode: shippingAddress?.postalCode || '',
        countryCode: shippingAddress?.countryCode || 'QA',
        amount: totalAmount,
        shippingFee: 500, // Hardcoded default or pull from body if you add it to schema later
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}