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
    const { couponId } = body;

    // Find the most recent pending order specifically for THIS user
    const latestPending = await prisma.order.findFirst({
      where: { 
        userId: session.user.id,
        status: { in: ['pending', 'PENDING', 'Pending'] } 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestPending) {
      return NextResponse.json({ success: false, message: 'No pending orders found for this user' });
    }

    // Mark order as completed and attach the userId explicitly
    await prisma.order.update({
      where: { id: latestPending.id },
      data: { 
        status: 'completed',
        userId: session.user.id 
      }
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

    return NextResponse.json({ success: true, updatedId: latestPending.id });
  } catch (error: any) {
    console.error('Complete latest error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}