import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest,params:any){
    try {

        const id=params.params.id;
        console.log(id);
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
          return NextResponse.json({ message: "Invalid token" }, { status: 400 });
        }
        const pgnum: any = req.nextUrl.searchParams.get("pgnum") ?? 0;
        const pgsize: number = 10;
        const status=req.nextUrl.searchParams.get("status");


        const user = await prismadb.user.findUnique({
          where: {
            id
          },
          include: {
            borrowings: {
              include: {
                sapati: true
              },
              skip: (pgnum ) * pgsize,
              take: pgsize,
              orderBy: {
                created_at:"desc"

              },
            
            },
            lendings: {
              include: {
                sapati: true
              },
              skip: (pgnum ) * pgsize,
              take: pgsize,
              orderBy: {
                created_at:"desc"
              },
             
            }
          }
        });
        if (!user) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }
        let borrowingsForMe=user.lendings.filter((item)=>((item.sapati.created_by==user.id&&item.sapati.created_for==existingToken.user_id)||(item.sapati.created_by==existingToken.user_id&&item.sapati.created_for==user.id)))

    

        //    getting borrowings from user
        //  user borrowings is lendings for me 
           let lendingsForMe=user.borrowings.filter((item)=>((item.sapati.created_by==user.id&&item.sapati.created_for==existingToken.user_id)||(item.sapati.created_by==existingToken.user_id&&item.sapati.created_for==user.id)))

          

           const rejectedBorrowings=borrowingsForMe.filter((item)=>(item.sapati.sapati_satatus=="DECLINED"))
           const settledBorrowings=borrowingsForMe.filter((item)=>(item.sapati.confirm_settlement))
           const activeBorrowings=borrowingsForMe.filter((item)=>(!item.sapati.confirm_settlement&&item.sapati.sapati_satatus!=="DECLINED"&&item.sapati.sapati_satatus!=="CHANGE"))
           const rejectedLendings=lendingsForMe.filter((item)=>(item.sapati.sapati_satatus=="DECLINED"))
           const settledLendings=lendingsForMe.filter((item)=>(item.sapati.confirm_settlement))
           const activeLendings=lendingsForMe.filter((item)=>(!item.sapati.confirm_settlement&&item.sapati.sapati_satatus!=="DECLINED"&&item.sapati.sapati_satatus!=="CHANGE"))
           let rejected=[...rejectedBorrowings,...rejectedLendings]
           let settled=[...settledBorrowings,...settledLendings]
           let active=[...activeBorrowings,...activeLendings]
           const activeBook=[]
           console.log(settled)
           console.log(active)
           console.log(rejected)

     for (const item of active) {
      const createbBy=item.sapati.created_by
      const receivedBy=item.sapati.created_for
      const creatorUser=await getUserById(createbBy!)
      const receiverUser=await getUserById(receivedBy!)

      console.log(receiverUser)
      console.log(creatorUser)
      console.log(createbBy,receivedBy);
      
      const remarks=item.sapati.remarks;
      const amount=item.sapati.amount;
      const type=item.sapati.type=="BORROWED"?"LENDED":"BORROWED"
      console.log(type)
      const returnDate=item.sapati.return_date     
      const paymentDate=item.sapati.taken_date
      // const isVerified=

     }


           if(status=="settled"){
           
            return NextResponse.json({message:"Successfully fetched transactions",data:settled},{status:200})
          }
    
          if(status=="rejected"){
           
            return NextResponse.json({message:"Successfully fetched transactions",data:rejected},{status:200})
          }

          if(status=="activebook"){
            return NextResponse.json({message:"Successfully fetched transactions of user",data:active},{status:200})

          }
           return NextResponse.json({message:"yes",},{status:200})

        
       
      }

    catch (error) {
        console.log(error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
        
    }

    
  }
