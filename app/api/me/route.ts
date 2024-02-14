import { getSapatiSum } from "@/lib/calculate-sapati";
import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface ExtendedUser extends User {
    borrowed?: number;
    lendings?: number;
    balance?: number;
    lent?: number;
    overallTransactions?: number;
}

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ message: "Authorization token missing" }, { status: 401 });
        }

        const bearerToken = token.split(" ")[1];
        const existingToken = await verifyBearerToken(bearerToken);
        if (!existingToken) {
            return NextResponse.json({ message: "Invalid token" }, { status: 498 });
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
        const overallTransactions = user.borrowings.length + user.lendings.length;

        let existingUser: ExtendedUser = await getUserById(user.id) as ExtendedUser;;

        existingUser.borrowed=borrowings;
        existingUser.lent=lendings; 
        existingUser.balance=balance; 
        existingUser.overallTransactions=overallTransactions; 


        

        
        return NextResponse.json({
            message: "Successfully fetched user",
            user: existingUser,
           
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
