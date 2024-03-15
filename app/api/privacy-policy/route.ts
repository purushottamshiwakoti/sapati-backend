export const dynamic = "force-dynamic";

import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const data=await prismadb.privacy.findFirst({})
        return NextResponse.json({message:"Successfully fetched data",data},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({error},{status:500})
    }
}