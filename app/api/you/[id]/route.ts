import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";
import { ExtendedUser } from "../../me/route";
import { getSapatiSum } from "@/lib/calculate-sapati";

export async function GET(req: NextRequest, params: any) {
  try {
    console.log(params.params.id);
    const id = params.params.id;
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization token missing" },
        { status: 400 }
      );
    }

    const bearerToken = token.split(" ")[1];
    const existingToken = await verifyBearerToken(bearerToken);
    if (!existingToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }
    const pgnum: any = req.nextUrl.searchParams.get("pgnum") ?? 0;
    const pgsize: number = 10;

    const user = await prismadb.user.findUnique({
      where: {
        id,
      },
      include: {
        borrowings: {
          include: {
            sapati: true,
          },
        },
        lendings: {
          include: {
            sapati: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    // getting user lending
    //    user lendings is borrowings for me
    let borrowingsForMe = user.lendings.filter(
      (item) =>
        (item.sapati.created_by == user.id &&
          item.sapati.created_for == existingToken.user_id) ||
        (item.sapati.created_by == existingToken.user_id &&
          item.sapati.created_for == user.id)
    );

    //    getting borrowings from user
    //  user borrowings is lendings for me
    let lendingsForMe = user.borrowings.filter(
      (item) =>
        (item.sapati.created_by == user.id &&
          item.sapati.created_for == existingToken.user_id) ||
        (item.sapati.created_by == existingToken.user_id &&
          item.sapati.created_for == user.id)
    );
    console.log(lendingsForMe);
    let borrowed = getSapatiSum(
      borrowingsForMe
        .filter(
          (item) =>
            item.sapati.sapati_satatus !== "DECLINED" &&
            item.sapati.sapati_satatus !== "SETTLED"
        )
        .map((item) => item.sapati.amount)
    );

    let lent = getSapatiSum(
      lendingsForMe
        .filter(
          (item) =>
            item.sapati.sapati_satatus !== "DECLINED" &&
            item.sapati.sapati_satatus !== "SETTLED"
        )
        .map((item) => item.sapati.amount)
    );
    const lentSettled = getSapatiSum(
      borrowingsForMe
        .filter((item) => item.sapati.sapati_satatus == "SETTLED")
        .map((item) => item.sapati.amount)
    );
    const borrowSettled = getSapatiSum(
      lendingsForMe
        .filter((item) => item.sapati.sapati_satatus == "SETTLED")
        .map((item) => item.sapati.amount)
    );
    console.log(borrowSettled);
    console.log(lentSettled);
    console.log(lent);
    lent = lent + lentSettled + borrowSettled;
    console.log(lent);
    console.log(borrowed);
    borrowed = borrowed + borrowSettled + lentSettled;
    console.log(borrowed);

    const borrowedTotal = getSapatiSum(
      borrowingsForMe
        .filter(
          (item) =>
            item.sapati.sapati_satatus !== "DECLINED" &&
            item.sapati.sapati_satatus != "SETTLED"
        )
        .map((item) => item.sapati.amount)
    );
    const lentTotal = getSapatiSum(
      lendingsForMe
        .filter(
          (item) =>
            item.sapati.sapati_satatus !== "DECLINED" &&
            item.sapati.sapati_satatus != "SETTLED"
        )
        .map((item) => item.sapati.amount)
    );

    const balance = lentTotal - borrowedTotal;
    const overallTransactions = lendingsForMe.length + borrowingsForMe.length;
    const settledLent = lendingsForMe.filter(
      (item) => item.sapati.confirm_settlement == true
    );
    const rejectedLent = lendingsForMe.filter(
      (item) => item.sapati.sapati_satatus == "DECLINED"
    );
    const pendingLent = lendingsForMe.filter(
      (item) => !item.sapati.confirm_settlement
      //  &&
      //   item.sapati.sapati_satatus == "APPROVED"
    );
    const settledBorrowings = borrowingsForMe.filter(
      (item) => item.sapati.confirm_settlement == true
    );
    const rejectedBorrowings = borrowingsForMe.filter(
      (item) => item.sapati.sapati_satatus == "DECLINED"
    );
    const pendingBorrowings = borrowingsForMe.filter(
      (item) => !item.sapati.confirm_settlement
      // &&
      //   item.sapati.sapati_satatus == "APPROVED"
    );
    const settled = settledLent.length + settledBorrowings.length;
    const rejected = rejectedLent.length + rejectedBorrowings.length;
    const activeBook = pendingLent.length + pendingBorrowings.length;

    const modifiedUser = {
      id: user.id,
      fullName: user.fullName,

      first_name: user.first_name,
      last_name: user.last_name,
      image: user.image,
      is_verified: user.is_verified,
      phone_number: user.phone_number,
      borrowed: lent,
      lent: borrowed,
      balance: borrowed - lent,
      overallTransactions,
      activeBook,
      settled,
      rejected,
    };

    // if(!findUser){
    //     return NextResponse.json({message:"No user found"},{status:404})
    // }

    return NextResponse.json(
      { message: "Successfully fetched user", user: modifiedUser },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
