import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { sessionId, exitPage, totalDuration } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    const updated = await db.updateSession(sessionId, {
      ended_at: new Date().toISOString(),
      exit_page: exitPage,
      total_duration: totalDuration,
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
