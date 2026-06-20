import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/notices/[id] - Update notice title, content, or pinned state (Admin)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const noticeId = parseInt(id, 10);

    if (isNaN(noticeId)) {
      return NextResponse.json({ error: 'Invalid notice ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, is_pinned } = body;

    const info = await db.prepare(`
      UPDATE notices
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          is_pinned = COALESCE(?, is_pinned)
      WHERE id = ?
    `).run(
      title || null,
      content || null,
      is_pinned !== undefined ? (is_pinned ? 1 : 0) : null,
      noticeId
    );

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    const updatedNotice = await db.prepare('SELECT * FROM notices WHERE id = ?').get(noticeId);
    return NextResponse.json(updatedNotice);
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
    const { id } = await params;
    const noticeId = parseInt(id, 10);

    if (isNaN(noticeId)) {
      return NextResponse.json({ error: 'Invalid notice ID' }, { status: 400 });
    }

    const info = await db.prepare('DELETE FROM notices WHERE id = ?').run(noticeId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
