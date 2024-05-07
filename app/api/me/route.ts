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

    const user = await prismadb.user.findUnique({
      where: {
        id: existingToken.user_id,
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

    const borrowings = getSapatiSum(
      user.borrowings
        .filter((item) => item.sapati.sapati_satatus !== "DECLINED")
        .map((item) => item.sapati.amount)
    );
    const lendings = getSapatiSum(
      user.lendings
        .filter((item) => item.sapati.sapati_satatus !== "DECLINED")
        .map((item) => item.sapati.amount)
    );
    const balance = borrowings - lendings;
    console.log(user.borrowings);
    // const overallTransactions =
    //   user.borrowings.filter((item) => item.sapati.sapati_satatus != "DECLINED")
    //     .length +
    //   user.lendings.filter((item) => item.sapati.sapati_satatus !== "DECLINED")
    //     .length;

    const takenTransactions = user.borrowings.filter(
      (item) =>
        item.sapati.sapati_satatus == "APPROVED" ||
        item.sapati.sapati_satatus == "SETTLED"
    );
    console.log(user.lendings);
    const uniqueLendings = new Map();

    // Iterate through the data array and populate the uniqueEntriesMap
    user.lendings.forEach((item) => {
      const key = item.sapati.created_by + "-" + item.sapati.created_for;
      uniqueLendings.set(key, item);
    });

    // Convert the map values back to an array to get the unique entries
    const userLendings = Array.from(uniqueLendings.values());

    console.log(userLendings);

    const givenTransactions = userLendings.filter(
      (item) =>
        item.sapati.sapati_satatus == "APPROVED" ||
        item.sapati.sapati_satatus == "SETTLED"
    );
    console.log(givenTransactions);
    const pendingGiven = userLendings.filter(
      (item) =>
        item.sapati.sapati_satatus == "APPROVED" &&
        !item.sapati.confirm_settlement
    );

    const uniqueBorrowings = new Map();

    // Iterate through the data array and populate the uniqueEntriesMap
    user.borrowings.forEach((item) => {
      const key = item.sapati.created_by + "-" + item.sapati.created_for;
      uniqueBorrowings.set(key, item);
    });

    // Convert the map values back to an array to get the unique entries
    const userBorrowings = Array.from(uniqueBorrowings.values());

    console.log(userBorrowings);
    const pendingTaken = userBorrowings.filter(
      (item) =>
        item.sapati.sapati_satatus == "APPROVED" &&
        !item.sapati.confirm_settlement
    );
    // const overallTransactions =givenTransactions.length+takenTransactions.length+pendingGiven.length+pendingTaken.length
    const allTransactions = [...userLendings, ...userBorrowings];

    // Create a map to store unique transactions
    const uniqueTransactionKeys = new Map();

    // Iterate through all transactions and populate the uniqueTransactionKeys map
    allTransactions.forEach((item) => {
      const key = `${item.sapati.created_by}-${item.sapati.created_for}-${item.sapati.type}`;
      uniqueTransactionKeys.set(key, item);
    });

    // Create an array to store unique transactions
    const uniqueTransactions = Array.from(uniqueTransactionKeys.values());

    console.log(uniqueTransactions);

    // const overallTransactions = userOverall.filter(
    //   (item) => item.sapati.sapati_satatus != "DECLINED"
    // ).length;

    const overallTransactions = 122;

    let existingUser: ExtendedUser = (await getUserById(
      user.id
    )) as ExtendedUser;

    existingUser.borrowed = borrowings;
    existingUser.lent = lendings;
    existingUser.balance = balance;
    existingUser.givenTransactions = givenTransactions.length;
    existingUser.takenTransactions = takenTransactions.length;
    existingUser.activeTransactions = pendingGiven.length + pendingTaken.length;
    // existingUser.overallTransactions=givenTransactions.length+takenTransactions.length+pendingGiven.length+pendingTaken.length;
    existingUser.overallTransactions = overallTransactions;

    return NextResponse.json(
      {
        message: "Successfully fetched user",
        user: existingUser,
      },
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
