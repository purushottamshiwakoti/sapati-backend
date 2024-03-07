import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
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

    const pgnum: any = searchParams.get("pgnum") ?? 0;
    const pgsize: number = 10;

    let borrowings = await prismadb.borrowings.findMany({
      skip: parseInt(pgnum) * pgsize,
      take: pgsize,
      where: {
        user_id: existingToken.user_id,
      },
      include: {
        sapati: true,
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const lendings = await prismadb.lendings.findMany({
      skip: parseInt(pgnum) * pgsize,
      take: pgsize,
      where: {
        user_id: existingToken.user_id,
      },
      include: {
        sapati: true,
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    console.log(lendings.length);

    for (const item of borrowings) {
      const phone = parseInt(item.sapati.phone);
      if (!isNaN(phone)) {
        const borrower_user = await getUserByPhone(phone);
        const creatorUser = await getUserById(item.sapati.created_by!);
        item.user_id = borrower_user?.id || "";
        item.user.first_name = borrower_user?.first_name || "";
        item.user.last_name = borrower_user?.last_name || "";
        item.user.fullName =
          existingToken.user_id == item.sapati.created_by
            ? item.sapati.fullName
            : creatorUser?.first_name + " " + creatorUser?.last_name;
        //  item.user.first_name + " " + item.user.last_name;
        item.user.is_verified = borrower_user?.is_verified || false;
        item.user.image =
          existingToken.user_id == item.sapati.created_by
            ? borrower_user?.image ?? null
            : creatorUser?.image ?? null;

        // item.creatorName = borrower_user?.first_name||"";

        // You can access the index using 'index' variable here
      } else {
        console.log(
          `Index: ${item}, Invalid phone number: ${item.sapati.phone}`
        );
      }
    }

    for (const item of lendings) {
      const phone = parseInt(item.sapati.phone);
      if (!isNaN(phone)) {
        const borrower_user = await getUserByPhone(phone);
        const creatorUser = await getUserById(item.sapati.created_by!);

        item.user_id = borrower_user?.id || "";
        item.user.first_name = borrower_user?.first_name || "";
        item.user.last_name = borrower_user?.last_name || "";
        item.user.fullName =
          existingToken.user_id == item.sapati.created_by
            ? item.sapati.fullName
            : creatorUser?.first_name + " " + creatorUser?.last_name;
        // item.user.first_name + " " + item.user.last_name;
        item.user.is_verified = borrower_user?.is_verified || false;
        item.user.image =
          existingToken.user_id == item.sapati.created_by
            ? borrower_user?.image ?? null
            : creatorUser?.image ?? null;
        // item.creatorName = borrower_user?.first_name;

        // You can access the index using 'index' variable here
      } else {
        console.log(
          `Index: ${item}, Invalid phone number: ${item.sapati.phone}`
        );
      }
    }

    const sapatiTaken = borrowings
      .filter((item) => item.sapati.sapati_satatus == "PENDING")
      .map((item) => ({
        user_id: item.user_id,
        sapati_id: item.sapati_id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        fullName: item.user.fullName,
        isverified: item.user.is_verified,
        created_at: item.sapati.created_at,
        status: "Borrowed",
        // status: "Lent",
        sapati_status: item.sapati.sapati_satatus,
        confirm_settlement: item.sapati.confirm_settlement,
        amount: item.sapati.amount,
        image: item.user.image,
        creatorId: item.sapati.created_by,
        currentUserId: existingToken.user_id,
        userName: item.sapati.created_user_name,
        userImage: item.sapati.created_user_image,
      }));
    const sapatiGiven = lendings

      .filter((item) => item.sapati.sapati_satatus == "PENDING")
      .map((item) => ({
        user_id: item.user_id,
        sapati_id: item.sapati_id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        fullName: item.user.fullName,
        isverified: item.user.is_verified,
        created_at: item.sapati.created_at,
        status: "Lent",
        // status: "Borrowed",
        sapati_status: item.sapati.sapati_satatus,
        confirm_settlement: item.sapati.confirm_settlement,
        amount: item.sapati.amount,
        image: item.user.image,
        creatorId: item.sapati.created_by,
        currentUserId: existingToken.user_id,
        userName: item.sapati.created_user_name,
        userImage: item.sapati.created_user_image,
      }));

    let data = [...sapatiTaken, ...sapatiGiven];
    data.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(
      { message: "Successfully fetched active transactions", data },
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
