import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, userId, totalAmount, shippingFee, couponId } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    // Use a Prisma transaction to ensure the order is created and the coupon is marked used safely
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          email: shippingAddress?.email || '',
          fullName: shippingAddress?.fullName || '',
          addressLine: shippingAddress?.addressLine || '',
          city: shippingAddress?.city || '',
          postalCode: shippingAddress?.postalCode || '',
          countryCode: shippingAddress?.countryCode || 'QA',
          amount: totalAmount,
          shippingFee: shippingFee ?? 500,
          status: 'pending',
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          },
        },
      });

      // 2. If a coupon was applied, update timesUsed and insert into RedeemedCoupon
      if (couponId) {
        const coupon = await tx.coupon.findUnique({
          where: { id: couponId },
        });

        if (coupon) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { timesUsed: { increment: 1 } },
          });

          await tx.redeemedCoupon.upsert({
            where: {
              userId_couponId: {
                userId,
                couponId,
              },
            },
            update: {},
            create: {
              userId,
              couponId,
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}