import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){

    const {token}=await req.json();
    try {
        await prismadb.bearerToken.delete({
                    where:{
                        id:token
                    }
                });
                return NextResponse.json({message:"Successfully logged out"},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({message:"Internal server error"},{status:500});
    }
}