import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getTableData('hosp_med_order');
    return NextResponse.json({ 
      data, 
      tableName: 'hosp_med_order',
      count: data?.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital medicine orders data' },
      { status: 500 }
    );
  }
}