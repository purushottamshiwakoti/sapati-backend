import prismadb from "@/lib/prismadb";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {

        const {device_token,isActive}=await req.json();

        

        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:498})
        }

        const requiredFields = [
       
            { field: device_token, fieldName: 'Device Token' }
        ];
        const errors:any = [];
    
        requiredFields.forEach(({ field, fieldName }) => {
            if (!field) {
                errors.push(`${fieldName} is required`);
            }
        });
    
        if (errors.length > 0) {
            return NextResponse.json({ error:errors[0] }, { status: 499 });
        }

        console.log(existingToken)

        if(isActive){
         const asd=   await prismadb.user.update({
                where:{
                    id:existingToken.user_id
                },
                data:{
                    device_token
                }
            });

            console.log(asd);

        }else{
           const ddd= await prismadb.user.update({
                where:{
                    id:existingToken.user_id
                },
                data:{
                    device_token:null
                }
            });
            console.log(ddd);

        }

        return NextResponse.json({message:"Notification updated successfully"},{status:200});

        
    } catch (error) {
        console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
        
    }
}