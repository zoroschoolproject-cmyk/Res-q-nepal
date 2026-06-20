import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/notifications - Get all notifications, sorted by newest first
export async function GET() {
  try {
    const client = db.getClient();
    const result = await client.execute('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    return NextResponse.json(result.rows);
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

    const client = db.getClient();
    await client.execute({
      sql: 'INSERT INTO notifications (title, message, type, is_read) VALUES (?, ?, ?, 0)',
      args: [title, message, type]
    });

    // Get last inserted row
    const lastInsertResult = await client.execute('SELECT last_insert_rowid() as id');
    const lastId = lastInsertResult.rows[0].id;
    const newNotificationResult = await client.execute({
      sql: 'SELECT * FROM notifications WHERE id = ?',
      args: [lastId]
    });
    
    return NextResponse.json(newNotificationResult.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH() {
  try {
    const client = db.getClient();
    await client.execute('UPDATE notifications SET is_read = 1');
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
