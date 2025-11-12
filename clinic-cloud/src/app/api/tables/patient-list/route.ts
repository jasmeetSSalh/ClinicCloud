import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getTableData('patient_list');
    return NextResponse.json({ 
      data, 
      tableName: 'patient_list',
      count: data?.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient list data' },
      { status: 500 }
    );
  }
}