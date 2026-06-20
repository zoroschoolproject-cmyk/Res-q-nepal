import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/notices/[id] - Update notice title, content, or pinned state (Admin)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const client = db.getClient();
    const { id } = await params;
    const noticeId = parseInt(id, 10);

    if (isNaN(noticeId)) {
      return NextResponse.json({ error: 'Invalid notice ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, is_pinned } = body;

    await client.execute({
      sql: `
        UPDATE notices
        SET title = COALESCE(?, title),
            content = COALESCE(?, content),
            is_pinned = COALESCE(?, is_pinned)
        WHERE id = ?
      `,
      args: [
        title || null,
        content || null,
        is_pinned !== undefined ? (is_pinned ? 1 : 0) : null,
        noticeId
      ]
    });

    // Check if row exists
    const checkResult = await client.execute({
      sql: 'SELECT * FROM notices WHERE id = ?',
      args: [noticeId]
    });
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    return NextResponse.json(checkResult.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/notices/[id] - Delete a notice (Admin)
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const client = db.getClient();
    const { id } = await params;
    const noticeId = parseInt(id, 10);

    if (isNaN(noticeId)) {
      return NextResponse.json({ error: 'Invalid notice ID' }, { status: 400 });
    }

    // Check if row exists first
    const checkResult = await client.execute({
      sql: 'SELECT * FROM notices WHERE id = ?',
      args: [noticeId]
    });
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    await client.execute({
      sql: 'DELETE FROM notices WHERE id = ?',
      args: [noticeId]
    });

    return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
