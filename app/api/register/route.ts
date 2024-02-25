import prismadb from "@/lib/prismadb";
import { sendSms } from "@/lib/send-sms";
import { generatePhoneVerificationToken } from "@/lib/tokens";
import { getUserByPhone } from "@/lib/user";
import { registerSchema } from "@/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){

    try {
const body=await req.json();
try {
   const abc= registerSchema.parse(body);
   console.log(abc);
  } catch (validationError:any) {
    return NextResponse.json({ message: validationError.errors[0].message }, { status: 400 });
  }
const {phone_number}=body
const phone =parseInt(phone_number)



const existingUser=await getUserByPhone(phone);

if(existingUser&&!existingUser?.is_verified){
    
    const token=await generatePhoneVerificationToken(phone);
   const sms= await sendSms(existingUser.phone_number,`Your otp for sapati is ${token}. Please verify it`);
    // if(!sms){
    // return NextResponse.json({message:"Unable to send otp!Please try again later",sms},{status:400})

    // }
    return NextResponse.json({message:"Otp sent successfully"},{status:200})

}
if(existingUser&&existingUser.is_verified){
    return NextResponse.json({message:"User already exists"},{status:409})

}

if(!existingUser){
    const user=await prismadb.user.create({
        data:{
            phone_number:phone
        }
    });
    const token=await generatePhoneVerificationToken(user.phone_number);
    const sms= await sendSms(user.phone_number,`Your otp for sapati is ${token}. Please verify it`);
    console.log(sms);
    // if(!sms){
    //     return NextResponse.json({message:"Unable to send otp!Please try again later",sms},{status:400})
    
    //     }
    return NextResponse.json({message:"Otp sent successfully"},{status:200})
}


    
        
    } catch (e) {
        console.log(e);
        return NextResponse.json({error:e},{status:500})
    }

}