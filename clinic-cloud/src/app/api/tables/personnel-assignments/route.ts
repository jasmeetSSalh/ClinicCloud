import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getTableData('hosp_personnel_pat_assign');
    return NextResponse.json({ 
      data, 
      tableName: 'hosp_personnel_pat_assign',
      count: data?.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personnel assignments data' },
      { status: 500 }
    );
  }
}