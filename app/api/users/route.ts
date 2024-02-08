import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const users=await prismadb.user.findMany({
            include:{
                sapatiRequests: true,
                requestedSapatis:true,
            }
        })

        return NextResponse.json({users},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}