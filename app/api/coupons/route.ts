import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, userId } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required.' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { redeemedBy: true }, // Must be redeemedBy, not usedBy
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: 'Invalid or expired coupon code.' }, { status: 400 });
    }

    if (userId) {
      const alreadyUsed = coupon.redeemedBy.some((item) => item.userId === userId);
      if (alreadyUsed) {
        return NextResponse.json({ success: false, error: 'You have already used this coupon.' }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      couponId: coupon.id,
      discountPercent: coupon.discountPercent,
      message: `Coupon applied: ${coupon.discountPercent}% off!`,
    });
  } catch (error) {
    console.error('Coupon error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}