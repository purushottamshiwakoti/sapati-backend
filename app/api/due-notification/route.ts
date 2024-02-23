import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { TrainTrackIcon } from "lucide-react";
import { NextResponse } from "next/server";

export async function GET(){
try {

    const nepalTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' });


    const date=new Date();
    console.log(date);
    // const sapati=await prismadb.sapati.findUnique({
    //     where:{
            
    //     }
    // })

    const lendings=await prismadb.lendings.findMany({
        where:{
            user_id:"65d6c6352bc0c8ba8b9c4e6f"
        }
    })

    console.log(lendings)

    // const dueSapati =sapati.filter((item)=>(item.return_date<date&&!item.confirm_settlement))
    
    // for (const item of dueSapati) {
    //     console.log(item)
    //     const sapatiType=item.type
    //     const createdBy=item.created_by
    //     const phone=item.phone
    //      const user=await  getUserByPhone(parseInt(phone));
    //      console.log(user)
    //      const userId=await getUserById(item.created_by!)
    //      if(userId?.id==item.created_by){
    //         // if(sapatiType=="LENDED"){
    //         //     await prismadb.notifications.create({
    //         //         data:{
    //         //             sapati_id:item.id,
    //         //             status:"DUE",
    //         //             user_id:user.id!,
    //         //             created_at:new Date(nepalTime)
    //         //         }
    //         //     })
    //             console.log("maile paunu paryo")
    //         }else{

    //             console.log("maile dina paryo");
    //         }
    //      }else{
    //         console.log(sapatiType);
    //      }
    // }

  const noti=  await prismadb.notifications.create({
                        data:{
                            sapati_id:lendings[0].sapati_id,
                            status:"DUE",
                            user_id:"65d6c6352bc0c8ba8b9c4e6f",
                            created_at:new Date(nepalTime)
                        }
                    })

    return NextResponse.json({message:"yes",lendings,noti},{status:200})
    
} catch (error) {
        console.log(error);
        return NextResponse.json({error: error},{status: 200});
}
}