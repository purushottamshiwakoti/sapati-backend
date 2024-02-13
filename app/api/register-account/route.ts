import prismadb from "@/lib/prismadb";
import { getUserByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs"
import { generateBearerToken } from "@/lib/tokens";
import { verifyBearerToken } from "@/lib/verifyBearerToken";


export async function POST(req:NextRequest) {
  try {

    const token=await req.headers

    const bearerToken=token.get("Authorization")?.split(" ")[1]

    const existingToken=await verifyBearerToken(bearerToken)
    if(!existingToken){
        return NextResponse.json({message:"Invalid token"},{status:498})
    }

    const {first_name,last_name,device_token,password,email} = await req.json();
    // const image = data.get("image");
    // const phone_number:any = data.get("phone_number");
    // const first_name:any = data.get("first_name");
    // const last_name:any = data.get("last_name");
    // const password:any = data.get("password");
    // const email:any = data.get("email");
    // const device_token:any = data.get("device_token");

  
    const requiredFields = [
        { field: first_name, fieldName: 'First Name' },
        { field: last_name, fieldName: 'Last Name' },
        { field: password, fieldName: 'Password' },
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




   


    const hashedPassword = await bcrypt.hash(password,10);
        const updateUser=  await prismadb.user.update({
            where:{
                id:existingToken.id
            },
            data:{
                first_name,
                last_name,
                password:hashedPassword,
                email,
                device_token
            }

          })

          const loginToken=await generateBearerToken(updateUser.id)

          return NextResponse.json({message:"Successfully updated account",token:loginToken},{status:200})

  
 
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
