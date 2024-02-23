import prismadb from "@/lib/prismadb";
import { getSapatiById } from "@/lib/sapati";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,params:any){
  const nepalTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' });

    try {
      const id=params.params.id
        const token = req.headers.get("Authorization");
        if (!token) {
          return NextResponse.json(
            { message: "Authorization token missing" },
            { status: 401 }
          );
        }
    
        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
          return NextResponse.json({ message: "Invalid token" }, { status: 498 });
        }
    
        const user = await getUserById(existingToken.user_id);
        if (!user) {
          return NextResponse.json({ message: "No user found" }, { status: 404 });
        }
        const sapati=await getSapatiById(id);
        if(!sapati){
          return NextResponse.json({message:"No sapati found"},{status:200});
        }

console.log(sapati);
        console.log(sapati.borrowings?.user_id)
        console.log(sapati.lendings?.user_id)

        console.log((sapati.borrowings?.user_id == existingToken.user_id) || (sapati.lendings?.user_id == existingToken.user_id))

        if ((sapati.borrowings?.user_id == existingToken.user_id) || (sapati.lendings?.user_id == existingToken.user_id)) {

          if(sapati.sapati_satatus=="PENDING"){
            return NextResponse.json({message:"You cannot settle pending sapati"},{status:200});
          }

        const settlement=  await prismadb.sapati.update({
            where:{
              id:sapati.id
            },
            data:{
              confirm_settlement:true,
              sapati_satatus:"APPROVED",
              settled_date:new Date(),
              settled_by:existingToken.user_id,
              settled_by_name:user.first_name+" "+user.last_name
            }
          });

          console.log(settlement);

          if(settlement.created_by==settlement.settled_by){
            const notificationUser=await getUserByPhone(parseInt(settlement.phone))
            console.log(notificationUser?.id);
            await prismadb.notifications.create({
              data:{
                  sapati_id:sapati.id,
                  status:"SETTLED",
                  user_id:notificationUser?notificationUser.id:"",
                  created_at:new Date(nepalTime)
              }
          })

          }else{

            await prismadb.notifications.create({
              data:{
                  sapati_id:sapati.id,
                  status:"SETTLED",
                  user_id:settlement.created_by!,
                  created_at:new Date(nepalTime)
              }
          })
          }

          return NextResponse.json({message: "Successfully setteled sapati",sapati},{status:200})
        }
        return NextResponse.json({ message: "No sapati found" }, { status: 403 });


        
    } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
    }

}