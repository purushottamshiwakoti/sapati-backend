import prismadb from "@/lib/prismadb";
import { getSapatiById } from "@/lib/sapati";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,params:any){
    try {
      const id=params.params.id
        const token = req.headers.get("Authorization");
        if (!token) {
          return NextResponse.json(
            { message: "Authorization token missing" },
            { status: 401 }
          );
        }
    
        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
          return NextResponse.json({ message: "Invalid token" }, { status: 498 });
        }
    
        const user = await getUserById(existingToken.user_id);
        if (!user) {
          return NextResponse.json({ message: "No user found" }, { status: 404 });
        }
        const sapati=await getSapatiById(id);
        if(!sapati){
          return NextResponse.json({message:"No sapati found"},{status:200});
        }

        if ((sapati.borrowings?.user_id == existingToken.user_id) || (sapati.lendings?.user_id == existingToken.user_id)) {

          await prismadb.sapati.update({
            where:{
              id:sapati.id
            },
            data:{
              confirm_settlement:true,
              sapati_satatus:"APPROVED"
            }
          })
          return NextResponse.json({message: "Successfully setteled sapati",sapati},{status:200})
        }
        return NextResponse.json({ message: "No sapati found" }, { status: 403 });


        
    } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
    }

}