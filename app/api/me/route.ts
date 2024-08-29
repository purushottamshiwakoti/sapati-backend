import { getSapatiSum } from "@/lib/calculate-sapati";
import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { User } from "next-auth";
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
  payeeCount?: number;
  receiverCount?: number;
  noData?: boolean;
  isActiveAvailable?: boolean;
  isData?: boolean;
  activeCount?: number;
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

    const user = await getUserById(existingToken.user_id);
    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    const status = req.nextUrl.searchParams.get("status");
    const search = req.nextUrl.searchParams.get("search");

    const pgnum: any = req.nextUrl.searchParams.get("pgnum") ?? 0;
    const pgsize: number = 10;

    let [borrowings, lendings] = await Promise.all([
      prismadb.borrowings.findMany({
        where: { user_id: existingToken.user_id },
        include: { sapati: true, user: true },
        orderBy: { created_at: "desc" },
      }),
      prismadb.lendings.findMany({
        where: { user_id: existingToken.user_id },
        include: { sapati: true, user: true },
        orderBy: { created_at: "desc" },
      }),
    ]);

    const processItems = async (items: any) => {
      const processedItems = [];
      for (const item of items) {
        const phone = parseInt(item.sapati.phone);
        if (!isNaN(phone)) {
          const borrower_user = await getUserByPhone(phone);
          const creatorUser = await getUserById(item.sapati.created_by!);
          const phone_number =
            creatorUser?.id === existingToken.user_id
              ? borrower_user?.phone_number
              : creatorUser?.phone_number;
          const fullName =
            creatorUser?.id === existingToken.user_id
              ? (borrower_user?.first_name?.trim() ?? "") +
                (borrower_user?.last_name?.trim() ?? "")
              : (creatorUser?.first_name?.trim() ?? "") +
                (creatorUser?.last_name?.trim() ?? "");
          item.user_id = borrower_user?.id || "";
          item.user.first_name = borrower_user?.first_name || "";
          item.user.last_name = borrower_user?.last_name || "";
          item.user.fullName = fullName;
          item.user.is_verified = borrower_user?.is_verified || false;
          item.user.image =
            existingToken.user_id == item.sapati.created_by
              ? borrower_user?.image ?? null
              : creatorUser?.image ?? null;
          item.user.phone_number = phone_number!;
          processedItems.push(item);
        } else {
          console.log(
            `Index: ${item}, Invalid phone number: ${item.sapati.phone}`
          );
        }
      }
      return processedItems;
    };

    const processedBorrowings = await processItems(borrowings);
    const processedLendings = await processItems(lendings);

    const sapatiTaken = processedBorrowings.map((item) => ({
      user_id: item.user_id,
      sapati_id: item.sapati_id,
      first_name: item.user.first_name,
      last_name: item.user.last_name,
      isverified: item.user.is_verified,
      created_at: item.sapati.created_at,
      status: "Borrowed",
      sapati_status: item.sapati.sapati_satatus,
      confirm_settlement: item.sapati.confirm_settlement,
      amount: item.sapati.amount,
      image: item.user.image,
      creatorId: item.sapati.created_by,
      createdForId: item.sapati.created_for,
      currentUserId: existingToken.user_id,
      userName: item.sapati.created_user_name,
      userImage: item.sapati.created_user_image,
      phone_number: item.user.phone_number,
      fullName: item.user.fullName,
    }));

    const sapatiGiven = processedLendings.map((item) => ({
      user_id: item.user_id,
      sapati_id: item.sapati_id,
      first_name: item.user.first_name,
      last_name: item.user.last_name,
      isverified: item.user.is_verified,
      created_at: item.sapati.created_at,
      status: "Lent",
      sapati_status: item.sapati.sapati_satatus,
      confirm_settlement: item.sapati.confirm_settlement,
      amount: item.sapati.amount,
      image: item.user.image,
      creatorId: item.sapati.created_by,
      createdForId: item.sapati.created_for,
      currentUserId: existingToken.user_id,
      userName: item.sapati.created_user_name,
      userImage: item.sapati.created_user_image,
      phone_number: item.user.phone_number,
      fullName: item.user.fullName,
    }));

    const data = [...sapatiGiven, ...sapatiTaken];

    const ids: any[] = [];
    const userData: any[] = [];

    for (const item of data) {
      if (!ids.includes(item.phone_number)) {
        ids.push(item.phone_number);
      }
    }

    for (const id of ids) {
      let totalAmount = 0;
      let totalBorrowed = 0;
      let totalLent = 0;
      let totalSettled = 0;

      const allData = data.filter((item) => item.phone_number == id);
      const user = await getUserByPhone(id);

      for (const item of allData) {
        if (item.status == "Borrowed") {
          if (item.sapati_status == "SETTLED") {
            totalSettled += item.amount;
          } else if (item.sapati_status != "DECLINED") {
            totalBorrowed += item.amount;
          }
        } else if (item.status == "Lent") {
          if (item.sapati_status == "SETTLED") {
            totalSettled += item.amount;
          } else if (item.sapati_status != "DECLINED") {
            totalLent += item.amount;
          }
        }
        totalLent = totalLent + totalSettled;
        totalBorrowed = totalBorrowed + totalSettled;
        totalAmount = totalLent - totalBorrowed;
      }

      const firstItem = allData[0];

      userData.push({
        creatorId: user?.id,
        totalAmount: totalAmount,
        user_id: firstItem?.user_id,
        first_name: firstItem?.first_name,
        last_name: firstItem?.last_name,
        isverified: firstItem?.isverified,
        created_at: firstItem?.created_at,
        status: firstItem?.status,
        sapati_status: firstItem?.sapati_status,
        confirm_settlement: firstItem?.confirm_settlement,
        amount: firstItem?.amount,
        image: firstItem?.image,
        currentUserId: firstItem?.currentUserId,
        userName: firstItem?.userName,
        userImage: firstItem?.userImage,
        phone_number: firstItem?.phone_number,
        fullName: firstItem?.fullName,
      });
    }

    const payee = userData.filter((item: any) => item.totalAmount < 0);
    const receivee = userData.filter((item: any) => item.totalAmount > 0);

    let existingUser: ExtendedUser = (await getUserById(
      user.id
    )) as ExtendedUser;

    existingUser.lent = payee.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalAmount;
    }, 0);
    existingUser.borrowed = receivee.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalAmount;
    }, 0);
    existingUser.payeeCount = payee.length;
    existingUser.receiverCount = receivee.length;
    existingUser.noData = data.length == 0;
    existingUser.isData = payee.length === 0 && receivee.length === 0;
    existingUser.isActiveAvailable = payee.length > 0 || receivee.length > 0;
    existingUser.activeCount = payee.length + receivee.length;

    return NextResponse.json(
      { message: "Successfully fetched user", user: existingUser },
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
