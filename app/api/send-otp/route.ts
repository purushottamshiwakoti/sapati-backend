import { sendSms } from "@/lib/send-sms";
import { generatePhoneVerificationToken } from "@/lib/tokens";
import { getUserByPhone } from "@/lib/user";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone_number } = body;
    console.log(phone_number);
    if (!phone_number) {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 499 }
      );
    }
    const phone = parseInt(phone_number);
    const existingUser = await getUserByPhone(phone);
    if (!existingUser) {
      return NextResponse.json(
        { message: "User doesnot exists" },
        { status: 409 }
      );
    }

    const token = await generatePhoneVerificationToken(phone);
    const sms = await sendSms(
      existingUser.country_code!,
      existingUser.phone_number.toString(),
      `Your otp for sapati is ${token}. Please verify it`,
      existingUser.phone_number
    );
    if (sms.error) {
      return NextResponse.json({ message: sms.error }, { status: 400 });
    }

    return NextResponse.json(
      { message: "OTP Sent Successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
