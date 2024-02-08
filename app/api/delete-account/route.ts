import prismadb from "@/lib/prismadb";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {

        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:498})
        }

        await prismadb.user.delete({
            where:{
                id:existingToken.user_id
            }
        });

        return NextResponse.json({message:"Successfully deleted user"},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}