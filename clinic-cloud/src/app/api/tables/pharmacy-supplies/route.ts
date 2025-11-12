import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getTableData('pharm_supply_inventory');
    return NextResponse.json({ 
      data, 
      tableName: 'pharm_supply_inventory',
      count: data?.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pharmacy supply inventory data' },
      { status: 500 }
    );
  }
}