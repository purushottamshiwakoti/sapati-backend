import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
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
      return NextResponse.json({ message: "Invalid token" }, { status: 498 });
    }

    const user = await getUserById(existingToken.user_id);
    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }
    let borrowings = await prismadb.borrowings.findMany({
      where: {
        user_id: existingToken.user_id,
      },
      include: {
        sapati: true,
        user: true,
      },
    });

    const lendings = await prismadb.lendings.findMany({
      where: {
        user_id: existingToken.user_id,
      },
      include: {
        sapati: true,
        user: true,
      },
    });

    console.log(borrowings);
    for (const item of borrowings) {
      console.log(item);
      const phone = parseInt(item.sapati.phone);
      if (!isNaN(phone)) {
        const borrower_user = await getUserByPhone(phone);
        item.user_id = borrower_user?.id || "";
        item.user.first_name = borrower_user?.first_name || "";
        item.user.last_name = borrower_user?.last_name || "";
        item.user.fullName = borrower_user?.fullName || "";
        item.user.is_verified = borrower_user?.is_verified || false;
        item.user.image = borrower_user?.image || "";

        // You can access the index using 'index' variable here
      } else {
        console.log(
          `Index: ${item}, Invalid phone number: ${item.sapati.phone}`
        );
      }
    }

    for (const item of lendings) {
      console.log(item);
      const phone = parseInt(item.sapati.phone);
      if (!isNaN(phone)) {
        const borrower_user = await getUserByPhone(phone);
        item.user_id = borrower_user?.id || "";
        item.user.first_name = borrower_user?.first_name || "";
        item.user.last_name = borrower_user?.last_name || "";
        item.user.fullName = borrower_user?.fullName || "";
        item.user.is_verified = borrower_user?.is_verified || false;
        item.user.image = borrower_user?.image || "";

        // You can access the index using 'index' variable here
      } else {
        console.log(
          `Index: ${item}, Invalid phone number: ${item.sapati.phone}`
        );
      }
    }

    console.log(borrowings);
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
        sapati_status: item.sapati.sapati_satatus,
        confirm_settlement: item.sapati.confirm_settlement,
        amount: item.sapati.amount,
        image: item.user.image,
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
        sapati_status: item.sapati.sapati_satatus,
        confirm_settlement: item.sapati.confirm_settlement,
        amount: item.sapati.amount,
        image: item.user.image,
      }));

    console.log(sapatiGiven);
    console.log(sapatiTaken);

    const data = [...sapatiTaken, ...sapatiGiven];

    console.log(data);

    return NextResponse.json(
      { message: "Successfully fetched active transactions", data },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
