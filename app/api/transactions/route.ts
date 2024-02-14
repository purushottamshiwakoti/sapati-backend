import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest,searchParams: any){
    try {
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 401 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 498 });
        }

        const user=await getUserById(existingToken.user_id);
        if (!user) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }

        const status=req.nextUrl.searchParams.get("status");
        console.log(status);

        let data;


        const borrowings=await prismadb.borrowings.findMany({
            where:{
                user_id:existingToken.user_id,
            },
            include:{
                sapati:true,
                user:true,
            }
        });
        const lendings=await prismadb.lendings.findMany({
            where:{
                user_id:existingToken.user_id,
            },
            include:{
                sapati:true,
                user:true,
            }
        });

        const sapatiTaken=borrowings.map((item)=>(
            {
                fullName:item.user.fullName,
                isverified:item.user.is_verified,
                created_at:item.sapati.created_at,
                status:"Borrowed",
                sapati_status:item.sapati.sapati_satatus,
                confirm_settlement:item.sapati.confirm_settlement,
                amount:item.sapati.amount,
                image:item.user.image,
            }
        ))
        const sapatiGiven=lendings.map((item)=>(
            {
                fullName:item.user.fullName,
                isverified:item.user.is_verified,
                created_at:item.sapati.created_at,
                status:"Lent",
                sapati_status:item.sapati.sapati_satatus,
                confirm_settlement:item.sapati.confirm_settlement,
                amount:item.sapati.amount,
                image:item.user.image,
            }
        ));

        console.log(status);
        console.log(status=='given')

        if(status=='given'){
            data=[...sapatiGiven]
        }else if(status=='taken'){
            data=[...sapatiTaken]

        }else{

             data=[...sapatiGiven,...sapatiTaken]

        }



        return NextResponse.json({message:"ndbsnbdsnbs",data},{status:200})
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}