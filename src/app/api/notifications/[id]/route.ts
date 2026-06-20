import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/notifications/[id] - Mark a single notification as read
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const client = db.getClient();
    const { id } = await params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    // Check if row exists first
    const checkResult = await client.execute({
      sql: 'SELECT * FROM notifications WHERE id = ?',
      args: [notificationId]
    });
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await client.execute({
      sql: 'UPDATE notifications SET is_read = 1 WHERE id = ?',
      args: [notificationId]
    });

    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
