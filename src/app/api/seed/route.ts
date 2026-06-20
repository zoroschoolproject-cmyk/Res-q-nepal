import { NextResponse } from 'next/server';
import { initDb, reseedDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldReseed = searchParams.get('force') === 'true';
    
    if (shouldReseed) {
      const reseedResult = await reseedDatabase();
      return NextResponse.json(reseedResult);
    } else {
      await initDb();
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully' 
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
