import { NextResponse } from 'next/server';
import { getTableData, addEntry } from '@/lib/db';

export async function GET() {
  console.log("static route's get")
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


// export async function POST(request: Request){
//   console.log("static route")
//   try {
//     const data = await request.json();

//     console.log("data received");
//     console.log(data);

//     // const send = await addEntry(data);
//     // if(send.success){
//     //   return NextResponse.json(
//     //   {message: "Successfully Added New Entry"}, 
//     //   {status: 200});    
//     // } else {
//     //   return NextResponse.json({
//     //     error: "Failed to create new entry to ... table",
//     //   },
//     //   {status: 500}
//     //   )
//     // }


//   } catch (error) {
//     console.error("API Error: ", error);
//     return NextResponse.json({
//       error: "Failed to create new entry to ... table",
//     },
//     {status: 500}
//   )
//   }
// }