import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
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

    const pgnum = req.nextUrl.searchParams.get("pgnum") ?? 0;
    const pgsize = 10;

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

    const processItems = async (items) => {
      return Promise.all(
        items.map(async (item) => {
          const phone = parseInt(item.sapati.phone);
          if (!isNaN(phone)) {
            const borrower_user = await getUserByPhone(phone);
            const creatorUser = await getUserById(item.sapati.created_by);
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
            return {
              ...item,
              user_id: borrower_user?.id || "",
              user: {
                ...item.user,
                first_name: borrower_user?.first_name || "",
                last_name: borrower_user?.last_name || "",
                fullName,
                is_verified: borrower_user?.is_verified || false,
                image:
                  existingToken.user_id == item.sapati.created_by
                    ? borrower_user?.image ?? null
                    : creatorUser?.image ?? null,
                phone_number,
              },
            };
          }
          return null;
        })
      ).then((result) => result.filter((item) => item !== null));
    };

    const [processedBorrowings, processedLendings] = await Promise.all([
      processItems(borrowings),
      processItems(lendings),
    ]);

    const sapatiTaken = processedBorrowings.map((item) => ({
      user_id: item.user_id,
      sapati_id: item.sapati_id,
      first_name: item.user.first_name,
      last_name: item.user.last_name,
      isverified: item.user.is_verified,
      created_at: item.sapati.updated_at,
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
      fullName: item.sapati.fullName,
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
      fullName: item.sapati.fullName,
    }));

    let data = [...sapatiGiven, ...sapatiTaken];

    const ids = new Set(data.map((item) => item.phone_number));
    const userData = [];

    for (const id of ids) {
      let totalBorrowed = 0;
      let totalLent = 0;
      let totalSettled = 0;
      const allData = data.filter((item) => item.phone_number == id);
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
      }

      totalLent += totalSettled;
      totalBorrowed += totalSettled;
      const totalAmount = totalLent - totalBorrowed;
      const firstItem = allData[0];
      const newUser = await getUserByPhone(id);

      userData.push({
        creatorId: newUser?.id,
        totalAmount,
        ...firstItem,
        fullName: newUser?.fullName ?? firstItem?.fullName,
      });
    }

    data = userData;

    if (status === "given") {
      data = search
        ? data.filter(
            (item) =>
              item.status === "Lent" &&
              (item.sapati_status === "APPROVED" ||
                item.sapati_status == "SETTLED") &&
              item.totalAmount1 > 0 &&
              item.creatorId != item.currentUserId &&
              (item.fullName?.toLowerCase().startsWith(search.toLowerCase()) ||
                item.first_name
                  ?.toLowerCase()
                  .startsWith(search.toLowerCase()) ||
                item.last_name?.toLowerCase().startsWith(search.toLowerCase()))
          )
        : data.filter((item) => item.totalAmount > 0);
    } else if (status === "taken") {
      data = search
        ? data.filter(
            (item) =>
              item.status === "Borrowed" &&
              (item.sapati_status === "APPROVED" ||
                item.sapati_status == "SETTLED") &&
              item.totalAmount > 0 &&
              item.creatorId != item.currentUserId &&
              (item.fullName?.toLowerCase().startsWith(search.toLowerCase()) ||
                item.first_name
                  ?.toLowerCase()
                  .startsWith(search.toLowerCase()) ||
                item.last_name?.toLowerCase().startsWith(search.toLowerCase()))
          )
        : data.filter(
            (item) =>
              item.status === "Borrowed" &&
              (item.sapati_status === "APPROVED" ||
                item.sapati_status == "SETTLED") &&
              item.totalAmount > 0
          );
    } else if (status === "active") {
      data = search
        ? data.filter(
            (item) =>
              item.totalAmount != 0 &&
              // item.creatorId != item.currentUserId &&
              // (item.fullName?.toLowerCase().startsWith(search.toLowerCase()) ||
              //   item.first_name
              //     ?.toLowerCase()
              //     .startsWith(search.toLowerCase()) ||
              //   item.last_name?.toLowerCase().startsWith(search.toLowerCase()))
              item.phone_number.toString().includes(search)
          )
        : data.filter((item) => item.totalAmount != 0);
    } else {
      data = search
        ? data.filter((item) =>
            // item.creatorId != item.currentUserId &&
            // (item.fullName?.toLowerCase().startsWith(search.toLowerCase()) ||
            //   item.first_name
            //     ?.toLowerCase()
            //     .startsWith(search.toLowerCase()) ||
            //   item.last_name?.toLowerCase().startsWith(search.toLowerCase()))
            item.phone_number.toString().includes(search)
          )
        : data;
    }

    data = data
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);

    return NextResponse.json(
      { message: "Successfully fetched transactions", data },
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
