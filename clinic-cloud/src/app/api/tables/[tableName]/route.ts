import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tableName: string }> }
) {
  try {
    const { tableName } = await params;
    
    console.log("here's the table name", tableName);

    // Basic validation to prevent SQL injection
    if (!/^[a-z_]+$/.test(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }
    
    const data = await getTableData(tableName);
    return NextResponse.json({ data, tableName });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 }
    );
  }
}