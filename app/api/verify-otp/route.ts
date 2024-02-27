import prismadb from "@/lib/prismadb";
import { getPhoneNumberToken } from "@/lib/tokens";
import { getUserById, getUserByPhone, getVerificationTokenByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { otp } = body;


        const requiredFields = [{ field: otp, fieldName: 'Otp' }];
        const errors:any = [];

        requiredFields.forEach(({ field, fieldName }) => {
            if (!field) {
                errors.push(`${fieldName} is required`);
            }
        });

        if (errors.length > 0) {
            return NextResponse.json({ error:errors[0] }, { status: 499 });
        }

     

      

        const token = await getPhoneNumberToken(otp);
    

        if (!token) {
            return NextResponse.json({ message: "Invalid Otp" }, { status: 400 });
        }

        if (token.expires < new Date()) {
            return NextResponse.json({ message: "Otp has been already expired" }, { status: 400 });
        }
        const user=await getUserByPhone(token.phone_number);
        if(!user){
            return NextResponse.json({message:"User not found"},{status:403})
        }

      


        await prismadb.user.update({
            where:{
                phone_number:user.phone_number
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
