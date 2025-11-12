import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getTableData('hosp_supply_inventory');
    return NextResponse.json({ 
      data, 
      tableName: 'hosp_supply_inventory',
      count: data?.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital supply inventory data' },
      { status: 500 }
    );
  }
}