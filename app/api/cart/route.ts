import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, items: [] });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });
    return NextResponse.json({ success: true, items: cartItems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, productId, quantity, increment } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json({ success: false, error: 'Missing userId or productId' }, { status: 400 });
    }

    // ⚡ Blazing fast atomic increment (Zero GET pre-check required)
    if (increment) {
      await prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId } },
        update: { quantity: { increment: 1 } },
        create: { userId, productId, quantity: 1 }
      });
      return NextResponse.json({ success: true });
    }

    // Standard set/delete path for cart page quantity selectors
    if (quantity !== undefined) {
      if (quantity <= 0) {
        await prisma.cartItem.deleteMany({
          where: { userId, productId }
        });
      } else {
        await prisma.cartItem.upsert({
          where: { userId_productId: { userId, productId } },
          update: { quantity },
          create: { userId, productId, quantity }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}