import prismadb from "@/lib/prismadb";
import { getUserByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs"
import { generateBearerToken } from "@/lib/tokens";


export async function POST(req:NextRequest) {
  try {
    const data = await req.formData();
    // const image = data.get("image");
    const phone_number:any = data.get("phone_number");
    const first_name:any = data.get("first_name");
    const last_name:any = data.get("last_name");
    const password:any = data.get("password");
    const email:any = data.get("email");

  
    const requiredFields = [
        { field: phone_number, fieldName: 'Phone number ' },
        { field: first_name, fieldName: 'First Name' },
        { field: last_name, fieldName: 'Last Name' },
        { field: password, fieldName: 'Password' }
    ];
    const errors:any = [];

    requiredFields.forEach(({ field, fieldName }) => {
        if (!field) {
            errors.push(`${fieldName} is required`);
        }
    });

    if (errors.length > 0) {
        return NextResponse.json({ errors }, { status: 499 });
    }

    const phone=parseInt(phone_number)


     const user=await getUserByPhone(phone)

    if(!user){
        return NextResponse.json({ message: "User does not exist" }, { status: 403 });

    }

    if(!user.is_verified){
        return NextResponse.json({ message: "User has not verified otp yet" }, { status: 403 });

    }


    const hashedPassword = await bcrypt.hash(password,10);
        const updateUser=  await prismadb.user.update({
            where:{
                phone_number:phone
            },
            data:{
                first_name,
                last_name,
                password:hashedPassword,
                email
            }

          })

          const token=await generateBearerToken(updateUser.id)

          return NextResponse.json({message:"Successfully updated account",token:token},{status:200})

  
 
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
