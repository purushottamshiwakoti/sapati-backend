import prismadb from "@/lib/prismadb";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {

        const body=await req.json();
        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:498})
        }

        const {contacts}=body;

        if(!contacts){
            return NextResponse.json({message:"Contacts is required"},{status:499})
        }
        const phone = contacts.map((item:any) => {
            return { phone: parseInt(item.phone_number) };
        });

        const verifiedContacts=[]

     
        for (const item of phone) {
            const verifyContact = await prismadb.user.findUnique({
                where: {
                    phone_number: item.phone
                },
              
            });
            if(verifyContact){
                verifiedContacts.push(verifyContact)
            }
            // Add your logic to handle the verification of each contact here...
            console.log("Verified contact:", item.phone);
        }
        
        return NextResponse.json({message:"Sucessfully fetched verified contacts",verifiedContacts},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });

    }
}