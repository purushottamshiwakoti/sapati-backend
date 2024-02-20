import { formatDuration } from "@/lib/format-duration";
import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try {
        const { searchParams } = new URL(req.url);
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 401 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 498 });
        }

          const pgnum:any =searchParams.get("pgnum") ?? 0 ;
  const pgsize:number = 10;

        const notifications=await prismadb.notifications.findMany({
            skip: parseInt(pgnum) * pgsize,
            take: pgsize,
            where:{
                user_id:existingToken.user_id

            },
            include:{
                sapati:true,
                user:true,
            },
            orderBy:{
                created_at:"desc"
            }
            
        });

        
     const notificationsArray=[]
for(const item of notifications){

    console.log(item.sapati.sapati_satatus)

    console.log(item.sapati.created_by);

    const user:any=await getUserById(item.sapati.created_by as string)



    const takenDate:any = new Date(item.sapati.taken_date);
    const returnDate:any = new Date(item.sapati.return_date);
    const diff: number = returnDate - takenDate; // Difference in milliseconds
   
    const millisecondsInDay = 24 * 60 * 60 * 1000;
const days = diff / millisecondsInDay;

   const fromatDate=formatDuration(days)
    const request=item.status=="REQUEST"?`Request from ${item.sapati.created_user_name} `:item.sapati.sapati_satatus=="APPROVED"?`Sapati Approved from ${item.sapati.fullName} `:item.sapati.sapati_satatus=="DECLINED"?`Sapati Rejected from ${item.sapati.fullName} `:item.sapati.sapati_satatus=="CHANGE"?`Sapati Change Request from ${item.sapati.fullName} `:null;
    const requestDescription=item.sapati.sapati_satatus=="PENDING"?`${item.sapati.created_user_name} is ${item.sapati.type=="LENDED"?"requesting":"lending from"} you amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:item.sapati.sapati_satatus=="APPROVED"?`${item.sapati.fullName} accepted your request of amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:item.sapati.sapati_satatus=="DECLINED"?`${item.sapati.fullName} declined your request of amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:item.sapati.sapati_satatus=="CHANGE"?`${item.sapati.fullName} has requested to change request of amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:null;
    const status=item.sapati.sapati_satatus;
    const sapatiId=item.sapati.id;
    const createdAt=item.sapati.created_at;
    const image=user.image;
    const fullName=user.first_name?user?.first_name+" "+user.last_name:user.fullName;
    const phone=user?.phone_number;
    const remarks =item.sapati.remarks;
    const amount=item.sapati.amount;
    const duration=fromatDate

    notificationsArray.push(
        {
            request: request,
            requestDescription:requestDescription,
            status:status,
            sapatiId:sapatiId,
            createdAt:createdAt,
            userImage:image,
            fullName:fullName,
            phone:phone,
            remarks:remarks,
            amount:amount,
            duration:duration
        }
    )
}        
        return NextResponse.json({message:"yes",notificationsArray},{status:200})

        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}