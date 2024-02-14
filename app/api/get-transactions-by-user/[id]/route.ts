import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest,params:any){
    try {

        const id=params.params.id;
        console.log(id);
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
        const findUser=await getUserById(id);

        console.log(findUser);

        if(!findUser){
            return NextResponse.json({message:"No user found"},{status:404})
        }


        const borrowings=await prismadb.borrowings.findMany({
            where:{
                user_id:findUser.id,
            },
            include:{
                sapati:true,
                user:true,
            }
        });
        // const lendings=await prismadb.lendings.findMany({
        //     where:{
        //         user_id:findUser.
        //     },
        //     include:{
        //         sapati:true,
        //         user:true,
        //     }
        // });
        return NextResponse.json({message:"success",borrowings},{status:200});

        


        
    } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
        
    }

}