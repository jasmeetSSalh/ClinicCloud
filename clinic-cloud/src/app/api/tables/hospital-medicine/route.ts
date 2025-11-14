import { NextResponse } from 'next/server';
import { addEntry, getTableData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getTableData('hosp_med_inventory');
    return NextResponse.json({ 
      data, 
      tableName: 'hosp_med_inventory',
      count: data?.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital medicine inventory data' },
      { status: 500 }
    );
  }
}
