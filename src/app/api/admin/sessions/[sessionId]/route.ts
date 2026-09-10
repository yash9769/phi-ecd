import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const sessionId = resolvedParams.sessionId;

  const session = await db.getSessionById(sessionId);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  }

  const events = await db.getEventsBySessionId(sessionId);

  return NextResponse.json({
    success: true,
    session,
    events,
  });
}
