import prismadb from "@/lib/prismadb";
import { sendSms } from "@/lib/send-sms";
import { generatePhoneVerificationToken } from "@/lib/tokens";
import { getUserByPhone } from "@/lib/user";
import { registerSchema } from "@/schema";
import { NextRequest, NextResponse } from "next/server";
import { number } from "zod";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        try {
            const abc = registerSchema.parse(body);
        } catch (validationError: any) {
            return NextResponse.json({ message: validationError.errors[0].message }, { status: 400 });
        }
        const { phone_number, country_code } = body
        const phone = parseInt(phone_number)

        const existingUser = await getUserByPhone(phone);

        console.log(existingUser && existingUser.is_verified  && existingUser.country_code == country_code);

        if (existingUser && !existingUser.is_verified && existingUser.country_code == country_code) {
            const token = await generatePhoneVerificationToken(phone);
            // const sms = await sendSms(existingUser.country_code + existingUser.phone_number.toString(), `Your otp for sapati is ${token}. Please verify it`, existingUser.phone_number);
            // if (sms.error) {
            //     return NextResponse.json({ message: sms.error }, { status: 400 });
            // }
            // return NextResponse.json({ message: "OTP Sent Successfully" }, { status: 200 });
        }

        if (existingUser && existingUser.is_verified && existingUser.country_code == country_code) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

      

        if (!existingUser) {
            const user = await prismadb.user.create({
                data: {
                    phone_number: phone,
                    country_code
                }
            });
        
            const token = await generatePhoneVerificationToken(user.phone_number);
            // const sms = await sendSms(user.country_code + user.phone_number.toString(), `Your otp for sapati is ${token}. Please verify it`, user.phone_number);
            // if (sms.error) {
            //     return NextResponse.json({ message: sms.error }, { status: 400 });
            // }
            return NextResponse.json({ message: "OTP Sent Successfully" }, { status: 200 });
        }
        
        // Add a default response to handle any other cases
      
        return NextResponse.json({ message: "OTP Sent Successfully" }, { status: 200 });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ error: e }, { status: 500 });
    }
}
