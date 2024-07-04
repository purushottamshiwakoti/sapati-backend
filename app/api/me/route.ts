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

    let data;

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
    let noData;

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

    data = [...sapatiGiven, ...sapatiTaken];
    const ids: any[] = [];
    const userData: any[] = [];

    // Loop through the data to obtain unique creatorIds
    // for (const item of data) {
    //   console.log(item);
    //   if (!ids.includes(item.creatorId)) {
    //     ids.push(item.creatorId);
    //   }
    //   // if (!ids.includes(item.currentUserId)) {
    //   //   ids.push(item.currentUserId);
    //   // }
    // }

    for (const item of data) {
      if (!ids.includes(item.phone_number)) {
        ids.push(item.phone_number);
      }
    }
    // Now, iterate over the unique creatorIds
    for (const id of ids) {
      // Initialize total amount for this creatorId
      let totalAmount = 0;

      // Loop through data to aggregate amounts for the current creatorId
      // for (const item of data) {
      //   if (item.creatorId === id) {
      //     // Adjust amount based on sapati_status
      //     console.log(item);

      //     if (item.status == "Borrowed") {
      //       console.log("borrowed");
      //       totalAmount -= item.amount;
      //       console.log("borrowed", totalAmount);
      //     } else if (item.status == "Lent") {
      //       console.log("lend");

      //       totalAmount += item.amount;
      //       console.log("lend", totalAmount);
      //     }
      //   }
      //   console.log(totalAmount);
      // }

      let totalBorrowed = 0;
      let totalLent = 0;
      let totalSettled = 0;

      if (sapatiGiven.length == 0) {
        noData = true;
      } else {
        noData = false;
      }
      if (sapatiTaken.length == 0) {
        noData = true;
      } else {
        noData = false;
      }

      const allData = data.filter((item) => item.phone_number == 9862694813);
      const user = await getUserByPhone(9862694813);
      console.log(user);
      console.log(allData);

      for (const item of data) {
        if (item.phone_number === id) {
          // Adjust amount based on sapati_status
          if (item.status == "Borrowed") {
            // totalAmount -= item.amount;
            if (item.sapati_status == "SETTLED") {
              totalSettled += item.amount;
            } else if (item.sapati_status == "DECLINED") {
              continue;
            } else {
              totalBorrowed += item.amount;
            }
            console.log(item.amount);
            console.log(totalBorrowed);
          } else if (item.status == "Lent") {
            // totalAmount += item.amount;
            if (item.sapati_status == "SETTLED") {
              totalSettled += item.amount;
            } else if (item.sapati_status == "DECLINED") {
              continue;
            } else {
              totalLent += item.amount;
            }
          }
        }
        // if (item.creatorId === id) {
        //   // Adjust amount based on sapati_status
        //   if (item.status == "Borrowed") {
        //     totalAmount -= item.amount;
        //   } else if (item.status == "Lent") {
        //     totalAmount += item.amount;
        //   }
        // }
        totalLent = totalLent + totalSettled;
        totalBorrowed = totalBorrowed + totalSettled;
        totalAmount = totalLent - totalBorrowed;
      }

      // Find the first item with this creatorId to include additional data
      // const firstItem = data.find((item) => item.creatorId === id);
      const firstItem = data.find((item) => item.phone_number === id);
      const newUser = await getUserByPhone(id);

      // Push the aggregated data for this creatorId to userData array
      userData.push({
        // creatorId: id,
        creatorId: newUser?.id,
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

    console.log(userData);
    const combinedTransactions: any = {};
    for (const item of data) {
      const key = `${item.creatorId}-${item.createdForId}`;
      if (!combinedTransactions[key]) {
        combinedTransactions[key] = {
          creatorId: item.creatorId,
          createdForId: item.createdForId,
          totalAmount: 0,
          user_id: item.user_id,
          first_name: item.first_name,
          last_name: item.last_name,
          isverified: item.isverified,
          created_at: item.created_at,
          // status: item.status,
          sapati_status: item.sapati_status,
          confirm_settlement: item.confirm_settlement,
          amount: item.amount,
          image: item.image,
          currentUserId: item.currentUserId,
          userName: item.userName,
          userImage: item.userImage,
          phone_number: item.phone_number,
          fullName: item.fullName,
          // Add more properties as needed
        };
      }
      // Adjust total amount based on status
      if (item.status === "Borrowed") {
        combinedTransactions[key].totalAmount -= item.amount;
      } else if (item.status === "Lent") {
        combinedTransactions[key].totalAmount += item.amount;
      }
    }

    // Convert the combined transactions object to an array
    const combinedTransactionsArray: any[] =
      Object.values(combinedTransactions);

    console.log(combinedTransactionsArray);
    // data = Object.values(combinedTransactions);

    data = userData;
    console.log(data);

    console.log(data);
    const payee = (data = userData.filter(
      (item: any) =>
        // item.status == "Borrowed"
        // &&
        // (item.sapati_status === "APPROVED" ||
        //   item.sapati_status == "SETTLED")
        // item.sapati_status != "DECLINED" &&
        item.totalAmount < 0
    ));

    const receivee = (data = userData.filter(
      (item: any) =>
        // item.status == "Borrowed"
        // &&
        // (item.sapati_status === "APPROVED" ||
        //   item.sapati_status == "SETTLED")
        // item.sapati_status != "DECLINED" &&
        item.totalAmount > 0
    ));

    let existingUser: ExtendedUser = (await getUserById(
      user.id
    )) as ExtendedUser;

    // existingUser.lendings = payee.reduce((accumulator, currentValue) => {
    //   return accumulator + currentValue.totalAmount;
    // }, 0);
    existingUser.lent = payee.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalAmount;
    }, 0);
    existingUser.borrowed = receivee.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalAmount;
    }, 0);
    existingUser.payeeCount = payee.length;
    existingUser.receiverCount = receivee.length;
    existingUser.noData = noData;
    existingUser.isActiveAvailable =
      payee.length == 0 && receivee.length == 0 ? false : true;

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
