import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const client = db.getClient();
    const result = await client.execute('SELECT * FROM info_links');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching info links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}
