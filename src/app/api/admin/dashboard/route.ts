import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const client = db.getClient();
    
    // 1. Stats Counter queries
    const openComplaintsCountRes = await client.execute("SELECT COUNT(*) as count FROM complaints WHERE status != 'Resolved'");
    const activeDonorsCountRes = await client.execute("SELECT COUNT(*) as count FROM donors WHERE status = 'Approved'");

    const stats = {
      openComplaints: Number(openComplaintsCountRes.rows[0].count),
      activeDonors: Number(activeDonorsCountRes.rows[0].count),
    };

    // 2. Recent Activities Feed (Latest 10 complaints)
    const recentComplaintsRes = await client.execute(`
      SELECT 'Complaint' as type, subject as title, complaint_id as code, status, created_at 
      FROM complaints 
      ORDER BY created_at DESC LIMIT 10
    `);

    const activities = recentComplaintsRes.rows;

    // 3. Notifications log
    const notificationsRes = await client.execute('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20');

    return NextResponse.json({
      stats,
      activities,
      notifications: notificationsRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
