import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/notices - Retrieve notices
export async function GET(request: Request) {
  try {
    const client = db.getClient();
    const { searchParams } = new URL(request.url);
    const pinnedOnly = searchParams.get('pinned_only');

    let query = 'SELECT * FROM notices';
    if (pinnedOnly === 'true') {
      query += ' WHERE is_pinned = 1';
    }
    query += ' ORDER BY is_pinned DESC, created_at DESC LIMIT 50';

    const result = await client.execute(query);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/notices - Create a notice bulletin (Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, is_pinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const client = db.getClient();
    await client.execute({
      sql: 'INSERT INTO notices (title, content, is_pinned) VALUES (?, ?, ?)',
      args: [title, content, is_pinned ? 1 : 0]
    });

    // Get last inserted row
    const lastInsertResult = await client.execute('SELECT last_insert_rowid() as id');
    const lastId = lastInsertResult.rows[0].id;
    const newNoticeResult = await client.execute({
      sql: 'SELECT * FROM notices WHERE id = ?',
      args: [lastId]
    });
    
    return NextResponse.json(newNoticeResult.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
