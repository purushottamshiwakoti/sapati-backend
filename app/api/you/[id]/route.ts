import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";
import { ExtendedUser } from "../../me/route";
import { getSapatiSum } from "@/lib/calculate-sapati";

export async function GET(req:NextRequest,params:any){
    try {
        console.log(params.params.id);
        const id=params.params.id;
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 401 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 498 });
        }
        const pgnum: any = req.nextUrl.searchParams.get("pgnum") ?? 0;
        const pgsize: number = 10;

        const user=await prismadb.user.findUnique({
           
            where: {
                id
            },
            include: {
                borrowings: {
                    skip: parseInt(pgnum) * pgsize,
                    take: pgsize,
                    include: {
                        sapati: true
                    }
                },
                lendings: {
                    skip: parseInt(pgnum) * pgsize,
                    take: pgsize,
                    include: {
                        sapati: true
                    }
                }
            }
        });
        if (!user) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }

        const currentUser=await getUserById(existingToken.user_id)

        console.log(user)
           
        const borrowings = getSapatiSum(user.borrowings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).map(item => item.sapati.amount));
        const lendings = getSapatiSum(user.lendings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).map(item => item.sapati.amount));

        console.log(borrowings);
        console.log(lendings);
        // const balance = borrowings - lendings;
        const balance = lendings - borrowings;
        const overallTransactions = user.borrowings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).length + user.lendings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).length;
        const pendingBorrowings=user.borrowings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).filter((item)=>!item.sapati.confirm_settlement&&item.sapati.sapati_satatus=="APPROVED"||item.sapati.sapati_satatus=="PENDING");
        const settledBorrowings=user.borrowings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).filter((item)=>item.sapati.sapati_satatus=="APPROVED"&&item.sapati.confirm_settlement);
        const rejectedBorrowings=user.borrowings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).filter((item)=>item.sapati.sapati_satatus=="DECLINED"&&!item.sapati.confirm_settlement);
        const pendingLendings=user.lendings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).filter((item)=>!item.sapati.confirm_settlement&&item.sapati.sapati_satatus=="APPROVED"||item.sapati.sapati_satatus=="PENDING");
        const settledLendings=user.lendings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).filter((item)=>item.sapati.sapati_satatus=="APPROVED"&&item.sapati.confirm_settlement);
        const rejectedLendings=user.lendings.filter((item)=>parseInt(item.sapati.phone)==user.phone_number||parseInt(item.sapati.phone)==currentUser?.phone_number!).filter((item)=>item.sapati.sapati_satatus=="DECLINED"&&!item.sapati.confirm_settlement);


        const activeBook=pendingBorrowings.length+pendingLendings.length
        const settled=settledBorrowings.length+settledLendings.length
        const rejected=rejectedBorrowings.length+rejectedLendings.length

        
        

        const findUser: ExtendedUser=await getUserById(id) as ExtendedUser;
        // findUser.borrowed=borrowings; 
        findUser.borrowed=lendings; 
        // findUser.lent=lendings; 
        findUser.lent=borrowings; 
        findUser.balance=balance; 
        findUser.overallTransactions=overallTransactions; 
        findUser.activeBook=activeBook; 
        findUser.settled=settled; 
        findUser.rejected=rejected; 

        console.log(findUser);

        if(!findUser){
            return NextResponse.json({message:"No user found"},{status:404})
        }

        return NextResponse.json({message:"Successfully fetched user",user:findUser},{status:200});
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}