import { formatDuration } from "@/lib/format-duration";
import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try {
        const { searchParams } = new URL(req.url);
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 400 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 400 });
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
        console.log(notifications.filter((item)=>item.status=="DUE"))

     let notificationsArray=[]
for(const item of notifications){

    const user:any=await getUserById(item.sapati.created_by as string)
    const borrower_user = await getUserByPhone(parseInt(item.sapati.phone));
    const takenDate:any = new Date(item.sapati.taken_date);
    const returnDate:any = new Date(item.sapati.return_date);
    const diff: number = returnDate - takenDate; // Difference in milliseconds
   
    const millisecondsInDay = 24 * 60 * 60 * 1000;
const days = diff / millisecondsInDay;



   const fromatDate=formatDuration(days)
    const request=(item.status=="REQUEST")?`Request from ${item.sapati.created_user_name} `:(item.sapati.sapati_satatus=="APPROVED"&&item.status!=="SETTLED"&&item.status!=="DUE")?`Sapati Approved from ${item.sapati.fullName} `:item.sapati.sapati_satatus=="DECLINED"?`Sapati Rejected from ${item.sapati.fullName} `:item.sapati.sapati_satatus=="CHANGE"?`Sapati Change Request from ${item.sapati.fullName} `:item.status=="SETTLED"?`Settled from ${item.sapati.settled_by_name} `:item.status=="DUE"?`Due date has been crossed`:null;
    const requestDescription=item.status=="REQUEST"?`${item.sapati.created_user_name} is ${item.sapati.type=="LENDED"?"lending to":"requesting"} you amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:(item.status=="APPROVED"&&item.sapati.sapati_satatus=="APPROVED")?`${item.sapati.fullName} accepted your request of amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:(item.sapati.sapati_satatus=="DECLINED"&&item.status=="REJECTED")?`${item.sapati.fullName} declined your request of amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:(item.sapati.sapati_satatus=="CHANGE"&&item.status=="CHANGE")?`${item.sapati.fullName} has requested to change request of amount <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:item.status=="SETTLED"?` ${item.sapati.settled_by_name} have successfully settled sapati`:item.status=="DUE"?`${item.sapati.fullName} Sapati of amount has to be paid back <b>${item.sapati.amount}</b> for <b>${fromatDate}</b>`:null;
    const status=item.status!=="SETTLED"&&item.status!=="DUE"?item.sapati.sapati_satatus:item.status;
    const sapatiId=item.sapati.id;
    const createdAt=item.created_at;
    const image=   existingToken.user_id == item.sapati.created_by
    ? borrower_user?.image ?? null
    : user?.image ?? null;
    const fullName=user.first_name?user?.first_name+" "+user.last_name:user.fullName;
    const phone=user?.phone_number;
    const remarks =item.sapati.remarks;
    const declineReason =item.sapati.decline_reason;
    const amount=item.sapati.amount;
    const duration=fromatDate;
    const userId = 
    (item.status === "DUE" && item.due_type === "GET") ? item.sapati.created_by :
    (item.status === "REQUEST") ? item.sapati.created_by :
    item.sapati.created_for;
    const updatedAt=item.updated_at
    const sapatiStatus=item.sapati.type

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
            duration:duration,
            userId:userId,
            returnDate:returnDate,
            takenDate:takenDate,
            updatedAt:updatedAt,
            sapatiStatus:sapatiStatus,
            declineReason:declineReason

        }
    )
}    


    notificationsArray.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      console.log(notificationsArray)
        return NextResponse.json({message:"yes",notificationsArray},{status:200})

        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}