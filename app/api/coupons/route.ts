import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is missing' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Query database for the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
      include: { redeemedBy: true }
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: 'Invalid or expired coupon code.' }, { status: 400 });
    }

    // Check global usage limit if set
    if (coupon.maxUses !== null && coupon.timesUsed >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: 'This coupon has reached its maximum usage limit.' }, { status: 400 });
    }

    // Prevent single user from reusing the same coupon
    if (userId) {
      const alreadyRedeemed = coupon.redeemedBy.some((r) => r.userId === userId);
      if (alreadyRedeemed) {
        return NextResponse.json({ success: false, error: 'You have already redeemed this coupon.' }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      couponId: coupon.id,
      discountPercent: coupon.discountPercent,
      message: `Coupon applied: ${coupon.discountPercent}% off!`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}