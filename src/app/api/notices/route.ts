import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/notices - Retrieve notices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pinnedOnly = searchParams.get('pinned_only');

    let query = 'SELECT * FROM notices';
    if (pinnedOnly === 'true') {
      query += ' WHERE is_pinned = 1';
    }
    query += ' ORDER BY is_pinned DESC, created_at DESC LIMIT 50';

    const notices = await db.prepare(query).all();
    return NextResponse.json(notices);
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

    const info = await db.prepare(`
      INSERT INTO notices (title, content, is_pinned)
      VALUES (?, ?, ?)
    `).run(title, content, is_pinned ? 1 : 0);

    const newNotice = await db.prepare('SELECT * FROM notices WHERE id = ?').get(info.lastInsertRowid);
    return NextResponse.json(newNotice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
