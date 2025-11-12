import { NextResponse } from 'next/server';
import { getAllTables } from '@/lib/db';
import { deleteAllTables } from '@/lib/db';
import { createAllTables } from '@/lib/db';
import { populateAllTables } from '@/lib/db';

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

export async function POST() {
  try {
    const responseMessage = await createAllTables();
    return NextResponse.json({ message: 'Tables created successfully', result: responseMessage });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create tables' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const responseMessage = await deleteAllTables();
    return NextResponse.json({ message: 'Tables deleted successfully', result: responseMessage });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tables' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const responseMessage = await populateAllTables();
    return NextResponse.json({ message: 'Tables populated successfully', result: responseMessage });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to populate tables' },
      { status: 500 }
    );
  }
}