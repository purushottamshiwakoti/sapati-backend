import prismadb from "@/lib/prismadb";
import { getPhoneNumberToken } from "@/lib/tokens";
import { getUserByPhone, getVerificationTokenByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { otp, phone_number } = body;

        const phone=parseInt(phone_number)

        const requiredFields = [{ field: otp, fieldName: 'Otp' }, { field: phone_number, fieldName: 'Phone number' }];
        const errors:any = [];

        requiredFields.forEach(({ field, fieldName }) => {
            if (!field) {
                errors.push(`${fieldName} is required`);
            }
        });

        if (errors.length > 0) {
            return NextResponse.json({ error:errors[0] }, { status: 499 });
        }

        const user=await getUserByPhone(phone);
        console.log(user);

        if(!user){
            return NextResponse.json({ message: "User does not exists" }, { status: 403 });

        }


        const token = await getPhoneNumberToken(otp);
        console.log(token);

        if (!token) {
            return NextResponse.json({ message: "Invalid token" }, { status: 498 });
        }

        if (token.expires < new Date()) {
            return NextResponse.json({ message: "Otp has been already expired" }, { status: 498 });
        }


        if(token.phone_number!==phone){
            return NextResponse.json({ message: "Phone number does not match" }, { status: 498 });

        }

      


        await prismadb.user.update({
            where:{
                phone_number:phone
            },
            data:{
                is_verified:true,
            }
        })

        await prismadb.verifyPhoneNumber.delete({
            where:{
                token:otp
            }
        })


        return NextResponse.json({ message: "Otp verified successfully" }, { status: 200 });


    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
