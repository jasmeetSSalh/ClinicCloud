import { NextResponse } from 'next/server';
import { addEntry, deleteEntry, editEntry, getTableData, isKnownTable } from '@/lib/db';

type RouteContext = { params: Promise<{ tableName: string }> };

async function resolveTable(params: RouteContext['params']) {
  const { tableName } = await params;
  return isKnownTable(tableName) ? tableName.toLowerCase() : null;
}

function invalidTable() {
  return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
}

function writeResponse(result: { success: boolean; message: string }) {
  return result.success
    ? NextResponse.json({ message: result.message }, { status: 200 })
    : NextResponse.json({ error: result.message }, { status: 400 });
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const tableName = await resolveTable(params);
    if (!tableName) return invalidTable();

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

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const tableName = await resolveTable(params);
    if (!tableName) return invalidTable();

    const data = await request.json();
    return writeResponse(await addEntry(tableName, data.tableData ?? {}));
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Error inserting entry' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const tableName = await resolveTable(params);
    if (!tableName) return invalidTable();

    const data = await request.json();
    return writeResponse(
      await editEntry(tableName, data.existingEntry ?? {}, data.replacementEntry ?? {})
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Error updating entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const tableName = await resolveTable(params);
    if (!tableName) return invalidTable();

    const data = await request.json();
    return writeResponse(await deleteEntry(tableName, data.tableData ?? {}));
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Error deleting entry' }, { status: 500 });
  }
}
