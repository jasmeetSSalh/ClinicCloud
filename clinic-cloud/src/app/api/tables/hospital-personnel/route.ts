import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getTableData('hospital_personnel');
    return NextResponse.json({ 
      data, 
      tableName: 'hospital_personnel',
      count: data?.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital personnel data' },
      { status: 500 }
    );
  }
}