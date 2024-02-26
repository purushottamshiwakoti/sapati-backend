import { sendNotification } from "@/lib/notification";
import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { TrainTrackIcon } from "lucide-react";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const nepalTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' });

    const date = new Date();
    console.log(date);
    const sapatis = await prismadb.sapati.findMany({
      where: {
        sapati_satatus:{
            equals:"PENDING"||"APPROVED"
        },
       confirm_settlement:{
        equals:false
       },
        return_date: {
          lt: date 
        },
      },
      orderBy:{
        updated_at:"desc"
      }
    });


    for (const item of sapatis) {

        const creator=item.created_by;
        const receiver=item.created_for;
        const type=item.type;
        console.log(type);
        const creatorUser=await getUserById(creator!)
        const receiverUser=await getUserById(receiver!)
      if(type=="LENDED"){
        console.log("paunu parni",creator,receiver)
        await prismadb.notifications.createMany({
            data:[
                {
                    sapati_id:item.id,
                    status:"DUE",
                    user_id:creator!,
                    created_at:new Date(nepalTime),
                    due_type:"GET",
                },
                {
                    sapati_id:item.id,
                    status:"DUE",
                    user_id:receiver!,
                    created_at:new Date(nepalTime),
                    due_type:"PAY",
                },
            ]
        })

       
        if(creatorUser&&creatorUser.device_token&&creatorUser.notification){
            await sendNotification(creatorUser.device_token,"Due Date Crossed", `${receiverUser?.first_name?receiverUser?.first_name+""+ receiverUser.last_name:receiverUser?.fullName} has to pay you ${item.amount}`)
         }
        if(receiverUser&&receiverUser.device_token&&receiverUser.notification){
            await sendNotification(receiverUser.device_token,"Due Date Crossed", `You must pay to ${creatorUser?.first_name?receiverUser?.first_name+""+ creatorUser.last_name:creatorUser?.fullName} amonut ${item.amount}`)
         }

      }else{
        await prismadb.notifications.createMany({
            data:[
                {
                    sapati_id:item.id,
                    status:"DUE",
                    user_id:receiver!,
                    created_at:new Date(nepalTime),
                    due_type:"GET",
                },
                {
                    sapati_id:item.id,
                    status:"DUE",
                    user_id:creator!,
                    created_at:new Date(nepalTime),
                    due_type:"PAY",
                },
            ]
        });
        if(creatorUser&&creatorUser.device_token&&creatorUser.notification){
            await sendNotification(creatorUser.device_token,"Due Date Crossed", `You must pay to ${receiverUser?.first_name?receiverUser?.first_name+""+ receiverUser.last_name:receiverUser?.fullName} amonut ${item.amount}`)
         }
        if(receiverUser&&receiverUser.device_token&&receiverUser.notification){
            await sendNotification(receiverUser.device_token,"Due Date Crossed", `${creatorUser?.first_name?creatorUser?.first_name+""+ creatorUser.last_name:creatorUser?.fullName} has to pay you ${item.amount}`)
         }
      }
        
    }

    return NextResponse.json({ message: "yes", sapatis }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 200 });
  }
}
