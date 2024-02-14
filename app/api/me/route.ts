import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
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


        const user=await prismadb.user.findUnique({
            where:{
                id:existingToken.user_id
            },
            include:{
                Borrowings:{
                    include:{
                        sapati:true,
                    }
                },
                Lendings:{
                    include:{
                        sapati:true,
                    }
                }
            }
        });

        if(!user){
            return NextResponse.json({message:"No user found"},{status:403})
        }
     


        return NextResponse.json({message:"Successfully fetched user",user},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }

}