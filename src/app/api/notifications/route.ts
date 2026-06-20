import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/notifications - Get all notifications, sorted by newest first
export async function GET() {
  try {
    const notifications = await db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/notifications - Add a notification manually
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, type } = body;

    if (!title || !message || !type) {
      return NextResponse.json({ error: 'Missing title, message, or type' }, { status: 400 });
    }

    const info = await db.prepare(`
      INSERT INTO notifications (title, message, type, is_read)
      VALUES (?, ?, ?, 0)
    `).run(title, message, type);

    const newNotification = await db.prepare('SELECT * FROM notifications WHERE id = ?').get(info.lastInsertRowid);
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH() {
  try {
    await db.prepare('UPDATE notifications SET is_read = 1').run();
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
