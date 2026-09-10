import { NextResponse } from 'next/server';
import { TOKEN_NAME } from '@/lib/adminAuth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(TOKEN_NAME);
  return response;
}
