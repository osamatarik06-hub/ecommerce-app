import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, userId, reason } = body;

    if (!orderId || !userId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, userId, and reason are required." },
        { status: 400 }
      );
    }

    // Check if a return request already exists for this order
    const existingReturn = await prisma.returnRequest.findFirst({
      where: { orderId },
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: "A return request has already been submitted for this order." },
        { status: 400 }
      );
    }

    // Create the return request in the database
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        userId,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, returnRequest }, { status: 201 });
  } catch (error) {
    console.error("Failed to create return request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}