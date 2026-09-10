import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter'); // 'today', 'yesterday', '7days', '30days', 'custom'
  
  let sessions = await db.getAllSessions();

  if (filter) {
    const now = new Date();
    if (filter === 'today') {
      sessions = sessions.filter((s) => new Date(s.started_at).toDateString() === now.toDateString());
    } else if (filter === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      sessions = sessions.filter((s) => new Date(s.started_at).toDateString() === yest.toDateString());
    } else if (filter === '7days') {
      const cut = new Date(now.getTime() - 7 * 86400000);
      sessions = sessions.filter((s) => new Date(s.started_at) >= cut);
    } else if (filter === '30days') {
      const cut = new Date(now.getTime() - 30 * 86400000);
      sessions = sessions.filter((s) => new Date(s.started_at) >= cut);
    }
  }

  return NextResponse.json({ success: true, sessions });
}
