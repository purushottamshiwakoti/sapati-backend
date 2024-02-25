import { sendSms } from "@/lib/send-sms";
import { generatePhoneVerificationToken } from "@/lib/tokens";
import { getUserByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {

        const body = await req.json();
        const {  phone_number } = body;
        if(!phone_number){
            return NextResponse.json({message:"Phone number is required"},{status:499})
        }
        const phone=parseInt(phone_number);
const existingUser=await getUserByPhone(phone);
    if(!existingUser){
    return NextResponse.json({message:"User doesnot exists"},{status:409})

        }

const token=await generatePhoneVerificationToken(phone);
const sms= await sendSms(existingUser.phone_number,`Your otp for sapati is ${token}. Please verify it`);
console.log(sms)
// if(!sms){
// return NextResponse.json({message:"Unable to send otp!Please try again later",sms},{status:400})

// }

return NextResponse.json({message:"Otp sent successfully"},{status:200})

        
        
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
        
    }
}