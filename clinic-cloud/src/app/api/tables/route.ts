import { NextResponse } from 'next/server';
import { getAllTables } from '@/lib/db';

export async function GET() {
  try {
    const tables = await getAllTables();
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}