import { getUserByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs"
import { generateBearerToken } from "@/lib/tokens";

export async function POST(req:NextRequest){
    try {
        const body=await req.json();
        console.log(body);
        const {phone_number,password}=body;

        const requiredFields = [
            { field: phone_number, fieldName: 'Phone number ' },
            { field: password, fieldName: 'Password' }
        ];
        const errors:any = [];
    
        requiredFields.forEach(({ field, fieldName }) => {
            if (!field) {
                errors.push(`${fieldName} is required`);
            }
        });
        

        const phone= parseInt(phone_number)

        const existingUser=await getUserByPhone(phone);

        if(!existingUser){
            return NextResponse.json({ message: "User does not exist" }, { status: 403 });
        }
        if(!existingUser.password){
            return NextResponse.json({ message: "Password is not added yet!" }, { status: 403 });

        }
        const checkPassword=await bcrypt.compare(password,existingUser.password);

        if(!checkPassword){
            return NextResponse.json({message:"Invalid credentials"},{status:403});
        }

        const token=await generateBearerToken(existingUser.id)
        
        return NextResponse.json({message:"Successfully logged in",token:token},{status:200})

        
        
    } catch (error) {
        console.log(error)
    return NextResponse.json({ error: error }, { status: 500 });
        
    }
}