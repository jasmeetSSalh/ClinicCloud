import { NextResponse } from 'next/server';
import { addEntry, getTableData } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tableName: string }> }
) {
  console.log("dynamic route get")
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

export async function POST(request:Request){
  try {
    console.log("dynamic post");

    let dateColumns: number[] = [];

    const data = await request.json();

    try {

      //console.log(data)
      // const postRes = await addEntry(data);

      let queryString = `INSERT INTO ${data.tableName} (`;

      Object.entries(data.tableData).forEach(([key, _], index)=> {
        if(index === Object.entries(data.tableData).length-1){
          queryString += `${key})`;

        } else {

          queryString += `${key},`;
          
        }

        
      });
      queryString += " VALUES (";
      console.log(Object.entries(data.tableData));
      Object.entries(data.tableData).forEach(([key, value], index)=> {
        if(index === Object.entries(data.tableData).length-1){
          if(value === ''){ // check if input is empty
            queryString += `null)`
          } else if(key.includes("DATE")){
            queryString += `TO_DATE('${value}', 'YYYY-MM-DD'))`
          } else if(!Number.isNaN(Number(value)) || value === null){
            queryString += `${value})`
          } else {
            queryString += `'${value}')`
          }

        } else {
          if(value === ''){ // check if there was no input for this field
            queryString += `null,`
          }else if(key.includes("DATE")){
            queryString += `TO_DATE('${value}', 'YYYY-MM-DD'),`
          } else if(!Number.isNaN(Number(value)) || value === null){ // check if the input is a number or not
            queryString += `${value},`
          } else {
            queryString += `'${value}',` // input as string
          }
        }

        
      });

      console.log(queryString)

      const res = await addEntry(queryString);
      if(!res.success){
        return Response.json({message: res.message},{status:500})
      } else {
        return Response.json({message: res.message},{status:200})
      }
      
    } catch (error) {
      return Response.json({error: error}, {status: 500});
    }

  


    return Response.json({message: "success"},{status: 200});
  } catch (error) {
    return Response.json({error: "Error POSTing table data"});
  }


}