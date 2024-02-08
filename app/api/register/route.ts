import prismadb from "@/lib/prismadb";
import { generatePhoneVerificationToken } from "@/lib/tokens";
import { getUserByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){

    try {
const body=await req.json();
const {phone_number}=body
const phone =parseInt(phone_number)

if(!phone){
    return NextResponse.json({message:"Phone number is required"},{status:499})
}

if(phone_number.length!==10){
    return NextResponse.json({message:"Phone number must be exact of 10 characters"},{status:406})

}

const existingUser=await getUserByPhone(phone);
console.log(existingUser)
if(existingUser){
    return NextResponse.json({message:"User already exists"},{status:409})

}

const user=await prismadb.user.create({
    data:{
        phone_number:phone
    }
});

const token=await generatePhoneVerificationToken(phone);

return NextResponse.json({message:"Otp sent successfully"},{status:200})
    
        
    } catch (e) {
        console.log(e);
        return NextResponse.json({error:e},{status:500})
    }

}