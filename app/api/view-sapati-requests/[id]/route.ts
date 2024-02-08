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

        const {request_status,decline_reason,change_reason}=await req.json();

        console.log(request_status);

       
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
            request_status:"APPROVED"
        }
    })

    return NextResponse.json({message:"Successfully approved sapati",},{status:200})
}else if(request_status==="REJECTED"){
    await prismadb.sapatiRequests.update({
        where:{
            id:sapati.id
        },
        data:{
            request_status:"REJECTED",
            decline_reason
        }
    });
    return NextResponse.json({message:"Successfully rejected sapati",},{status:200})


}else if(request_status==="CHANGE"){
    await prismadb.sapatiRequests.update({
        where:{
            id:sapati.id
        },
        data:{
            request_status:"CHANGE",
            change_reason
        }
    });
    return NextResponse.json({message:"Successfully requested to change sapati",},{status:200})


}else{
    return NextResponse.json({message:"Please choose one method ie:Pending, Approved Declined or Change",},{status:401})

}
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}