import { NextResponse } from 'next/server';

export async function GET() {
  const adsText = 'google.com, pub-7024167381666296, DIRECT, f08c47fec0942fa0'; // Replace with your actual AdSense publisher line
  return new NextResponse(adsText, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}