import { getSapatiSum } from "@/lib/calculate-sapati";
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
                borrowings:{
                    include:{
                        sapati:true,
                    }
                },
                lendings:{
                    include:{
                        sapati:true,
                    }
                }
            }
        });

        if(!user){
            return NextResponse.json({message:"No user found"},{status:403})
        }
        
      const borrowings=getSapatiSum(user.borrowings.map((item)=>(item.sapati.amount)))
      const lendings=getSapatiSum(user.lendings.map((item)=>(item.sapati.amount)))
      const balance=borrowings-lendings
      const overallTransactions=user.borrowings.length+user.lendings.length


        return NextResponse.json({message:"Successfully fetched user",borrowed:borrowings,lent:lendings,balance,overallTransactions},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }

}