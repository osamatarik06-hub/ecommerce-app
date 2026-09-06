import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Fetch products so the AI knows your current catalog and pricing
    const products = await prisma.product.findMany({
      select: { name: true, price: true, description: true },
      take: 20,
    });

    const catalogContext = products
      .map((p) => `- ${p.name}: $${(p.price / 100).toFixed(2)} - ${p.description}`)
      .join('\n');

    const systemInstruction = `You are Velvet's friendly and helpful AI customer service assistant. 
    Velvet is a curated e-commerce store offering products across Tech, Home, Style, and Beauty. 
    Here is a sample of our current product catalog:
    ${catalogContext}

    Answer customer questions politely, accurately, and concisely based on this store info. If a question requires account or personal order status, guide them to their account page or support email.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ reply: 'Sorry, I am having trouble connecting right now.' }, { status: 500 });
  }
}