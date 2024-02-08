import prismadb from "@/lib/prismadb";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:498})
        }

        const requests=await prismadb.user.findMany({
            include:{
                sapatiRequests:true
            }
        })

        return NextResponse.json({message:"All sapati requests fetched successfully",requests},{status:200});

        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}