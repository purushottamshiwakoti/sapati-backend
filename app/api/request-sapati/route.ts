import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {

        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:498})
        }

    let {amount,return_date,reason,requested_user_id} = await req.json();

    const requiredFields = [
        { field: amount, fieldName: 'Amount' },
        { field: return_date, fieldName: 'Return Date' },
        { field: reason, fieldName: 'Reason' },
        { field: requested_user_id, fieldName: 'User id' },
    ];
    const errors:any = [];

    requiredFields.forEach(({ field, fieldName }) => {
        if (!field) {
            errors.push(`${fieldName} is required`);
        }
    });

    if (errors.length > 0) {
        return NextResponse.json({ error:errors[0] }, { status: 499 });
    }

console.log(amount,return_date,reason,requested_user_id);

amount=parseInt(amount)

if(existingToken.user_id==requested_user_id){
    return NextResponse.json({message:"You cannot request sapati from self"},{status:403})
}



const requestedUser=await getUserById(requested_user_id);


if(!requestedUser){
    return NextResponse.json({ error: "Requested user does not exists" }, { status: 403 });
}

await prismadb.sapatiRequests.create({
    data:{
        amount,
        reason,
        return_date,
        user_id:existingToken.user_id,
        requested_user_id

    }
})
    return NextResponse.json({message:"Successfully requested sapati"},{status: 200});

        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}