import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest){
    try {
        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:498})
        }

        const body=await req.json();
        const {first_name,last_name,gender,email,dob}=body;

        const requiredFields = [
            { field: first_name, fieldName: 'First Name' },
            { field: last_name, fieldName: 'Last Name ' },
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

        const user=await getUserById(existingToken.user_id);

        if(!user){
            return NextResponse.json({message:"User does not exists"},{status:403})
        }

       const newUser= await prismadb.user.update({
            where:{
                id:user.id
            },
            data:{
                first_name,
                last_name,
                gender,
                email
            }
        })

            return NextResponse.json({message:"Successfully updated data",newUser},{status:200})
        



        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
        
    }

}