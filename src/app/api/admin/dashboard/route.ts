import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // 1. Stats Counter queries
    const openComplaintsCount = await db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status != 'Resolved'").get() as { count: number };
    const activeDonorsCount = await db.prepare("SELECT COUNT(*) as count FROM donors WHERE status = 'Approved'").get() as { count: number };

    const stats = {
      openComplaints: openComplaintsCount.count,
      activeDonors: activeDonorsCount.count,
    };

    // 2. Recent Activities Feed (Latest 10 complaints)
    const recentComplaints = await db.prepare(`
      SELECT 'Complaint' as type, subject as title, complaint_id as code, status, created_at 
      FROM complaints 
      ORDER BY created_at DESC LIMIT 10
    `).all() as any[];

    const activities = recentComplaints;

    // 3. Notifications log
    const notifications = await db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20').all();

    return NextResponse.json({
      stats,
      activities,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
