import prismadb from "@/lib/prismadb";
import { generatePhoneVerificationToken } from "@/lib/tokens";
import { getUserByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){

    try {
const body=await req.json();
const {phone_number}=body
const token=await generatePhoneVerificationToken(phone_number);

if(!phone_number){
    return NextResponse.json({message:"Phone number is required"},{status:499})
}

if(phone_number.length!==10){
    return NextResponse.json({message:"Phone number must be exact of 10 characters"},{status:406})

}

const existingUser=await getUserByPhone(phone_number);
if(existingUser){
    return NextResponse.json({message:"User already exists"},{status:409})

}

const user=await prismadb.user.create({
    data:{
        phone_number
    }
});



console.log(phone_number.length);

return NextResponse.json({message:"Yes man"},{status:200})
    
        
    } catch (e) {
        return NextResponse.json({error:e},{status:500})
    }

}