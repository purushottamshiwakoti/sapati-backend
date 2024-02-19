import prismadb from "@/lib/prismadb";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";
import { format, formatDistance } from 'date-fns';


export async function GET(req:NextRequest){
    try {
        const { searchParams } = new URL(req.url);
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 401 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 498 });
        }

          const pgnum:any =searchParams.get("pgnum") ?? 0 ;
  const pgsize:number = 10;

        const notifications=await prismadb.notifications.findMany({
            skip: parseInt(pgnum) * pgsize,
            take: pgsize,
            where:{
                user_id:existingToken.user_id

            },
            include:{
                sapati:true,
                user:true,
            }
            
        });

        const takenDate = new Date(notifications[0].sapati.taken_date);
        const returnDate = new Date(notifications[0].sapati.return_date);
        console.log(returnDate,takenDate)
    
     
        


        console.log(notifications[0].sapati.taken_date,notifications[0].sapati.return_date)

        const request=`Request from ${notifications[0].sapati.created_user_name} `;
        const requestDescription=` ${notifications[0].sapati.created_user_name} is requesting you amount ${notifications[0].sapati.amount} for 3 months`;
        const status=notifications[0].sapati.sapati_satatus;
        const sapatiId=notifications[0].sapati.id;
        const createdAt=notifications[0].sapati.created_at;

        console.log(createdAt,sapatiId,status)



        return NextResponse.json({message:"yes",notifications,request,requestDescription},{status:200})

        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}