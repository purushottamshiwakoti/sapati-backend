import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest, params:any){
    
    try {
        const id=params.params.id
        const users=await prismadb.user.findMany({
            where:{
                id
            },
            include:{
              borrowings:{
                include:{
                    sapati:true
                }
              },
              lendings:{
                include:{
                    sapati:true
                }
              },
              
            }
        })

        return NextResponse.json({users},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}