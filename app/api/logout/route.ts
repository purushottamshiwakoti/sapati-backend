import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){

    const {token }=await req.json();
    console.log(token);

    const bearerToken=await prismadb.bearerToken.findFirst({
        where:{
            token: token
        }
    })

    console.log(bearerToken);
    if(!bearerToken){
        return NextResponse.json({message:"Token not found"})
    }
    try {
        await prismadb.bearerToken.delete({
                    where:{
                        id:bearerToken.id,
                    }
                });
                return NextResponse.json({message:"Successfully logged out"},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({message:"Internal server error"},{status:500});
    }
}