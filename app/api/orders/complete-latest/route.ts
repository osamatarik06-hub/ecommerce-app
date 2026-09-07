import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { orderId, couponId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Missing order reference' }, { status: 400 });
    }

    // Find the specific order by its secure ID
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    // Ensure the order exists and strictly belongs to the logged-in user
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Only update if it's currently pending
    if (order.status.toLowerCase() === 'pending') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'completed' }
      });

      // Record coupon usage safely
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { timesUsed: { increment: 1 } }
        }).catch(() => {});

        await prisma.redeemedCoupon.create({
          data: { userId: session.user.id, couponId }
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, updatedId: orderId });
  } catch (error: any) {
    console.error('Complete order error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}