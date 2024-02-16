import { sendNotification } from "@/lib/notification";
import { NextResponse } from "next/server";

export async function GET(){
    try {

        const send=await sendNotification("fxYGxm1MSqWOPX_QYBWas4:APA91bFlYEYH6txXFOxT01tWDeCAKpvGVxB0s_ppyxiv7DcAOHTqmPd8GT9lXAWY_vVMDQmEM-gsWM7PQEmSz3uhwskdRy5TwG6i_Ax4x_BFTnq7u5Za17IumtwvXhtdjYczWmZSgsYC");
        console.log(send);

        return NextResponse.json({message:"yes"},{status:200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({message:"sdnbnbdsnbds"},{status:500})
    }
}