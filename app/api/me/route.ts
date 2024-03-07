import { getSapatiSum } from "@/lib/calculate-sapati";
import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface ExtendedUser extends User {
    borrowed?: number;
    lendings?: number;
    balance?: number;
    lent?: number;
    overallTransactions?: number;
    givenTransactions?: number;
    takenTransactions?: number;
    activeTransactions?: number;
    activeBook?: number;
    settled?: number;
    rejected?: number;
}

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 400 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 400 });
        }

        const user = await prismadb.user.findUnique({
            where: {
                id: existingToken.user_id
            },
            include: {
                borrowings: {
                    include: {
                        sapati: true
                    }
                },
                lendings: {
                    
                    include: {
                        sapati: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }


        const borrowings = getSapatiSum(user.borrowings.map(item => item.sapati.amount));
        const lendings = getSapatiSum(user.lendings.map(item => item.sapati.amount));
        const balance = borrowings - lendings;
        const overallTransactions = user.borrowings.
        length + user.lendings.length;
        const takenTransactions = user.borrowings.filter((item)=>(item.sapati.sapati_satatus=="APPROVED"))
        const givenTransactions = user.lendings.filter((item)=>(item.sapati.sapati_satatus=="APPROVED"))
        const pendingGiven = user.lendings.filter((item)=>(item.sapati.sapati_satatus=="PENDING"))
        const pendingTaken = user.borrowings.filter((item)=>(item.sapati.sapati_satatus=="PENDING"))

        let existingUser: ExtendedUser = await getUserById(user.id) as ExtendedUser;;

        existingUser.borrowed=borrowings;
        existingUser.lent=lendings; 
        existingUser.balance=balance; 
        existingUser.overallTransactions=overallTransactions; 
        existingUser.givenTransactions=givenTransactions.length
        existingUser.takenTransactions=takenTransactions.length
        existingUser.activeTransactions=pendingGiven.length+pendingTaken.length


        

        
        return NextResponse.json({
            message: "Successfully fetched user",
            user: existingUser,
           
        }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
