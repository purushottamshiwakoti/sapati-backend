import prismadb from "@/lib/prismadb";
import { getSapatiById } from "@/lib/sapati";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest,params:any){
    try {
const id=params.params.id;

const sapati=await getSapatiById(id);

if(!sapati){
    return NextResponse.json({message:"No sapati found of this data"},{status:404});

}

return NextResponse.json({message:"Successfully fetched sapati",sapati},{status:200});
        
    } catch (error) {
          console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    
    }
}

export async function PATCH(req:NextRequest,params:any){
    try {

        const {request_status}=await req.json();

       
        const id=params.params.id;

const sapati=await getSapatiById(id);
if(!sapati){
    return NextResponse.json({message:"No sapati found of this data"},{status:404});

}

if(request_status==="APPROVED"){
    await prismadb.sapatiRequests.update({
        where:{
            id:sapati.id
        },
        data:{
            
        }
    })
}
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}