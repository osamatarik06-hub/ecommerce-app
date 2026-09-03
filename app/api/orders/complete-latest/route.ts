import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Find the most recent order that is pending (handling any casing)
    const latestPending = await prisma.order.findFirst({
      where: { 
        status: { in: ['pending', 'PENDING', 'Pending'] } 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (latestPending) {
      await prisma.order.update({
        where: { id: latestPending.id },
        data: { status: 'completed' }
      });
      return NextResponse.json({ success: true, updatedId: latestPending.id });
    }

    return NextResponse.json({ success: false, message: 'No pending orders found' });
  } catch (error: any) {
    console.error('Complete latest error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}