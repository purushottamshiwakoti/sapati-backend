import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { Item } from "@radix-ui/react-dropdown-menu";
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

    const pgnum: any = parseInt(searchParams.get("pgnum") as string) || 0;
    const pgsize: any = parseInt(searchParams.get("pgsize") as string) || 10;

    const skip = pgnum * pgsize;

    const borrowings = await prismadb.borrowings.findMany({
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

    // Remaining code for processing and formatting results...
    for (const item of borrowings) {
      const phone = parseInt(item.sapati.phone);
      if (!isNaN(phone)) {
        const borrower_user = await getUserByPhone(phone);
        const creatorUser = await getUserById(item.sapati.created_by!);
        const phone_number =
          creatorUser?.id == existingToken.user_id
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
        // existingToken.user_id == item.sapati.created_by
        //   ? item.sapati.fullName
        //   : creatorUser?.first_name + " " + creatorUser?.last_name;
        //  item.user.first_name + " " + item.user.last_name;
        item.user.is_verified = borrower_user?.is_verified || false;
        item.user.image =
          existingToken.user_id == item.sapati.created_by
            ? borrower_user?.image ?? null
            : creatorUser?.image ?? null;

        item.user.phone_number = phone_number!;

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

        const phone_number =
          creatorUser?.id == existingToken.user_id
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
        // item.user.fullName =
        //   existingToken.user_id == item.sapati.created_by
        //     ? item.sapati.fullName
        //     : creatorUser?.first_name + " " + creatorUser?.last_name;
        // item.user.first_name + " " + item.user.last_name;
        item.user.is_verified = borrower_user?.is_verified || false;
        item.user.image =
          existingToken.user_id == item.sapati.created_by
            ? borrower_user?.image ?? null
            : creatorUser?.image ?? null;
        // item.creatorName = borrower_user?.first_name;

        item.user.phone_number = phone_number!;

        // You can access the index using 'index' variable here
      } else {
        console.log(
          `Index: ${item}, Invalid phone number: ${item.sapati.phone}`
        );
      }
    }

    const sapatiTaken = borrowings
      // .filter((item) => item.sapati.sapati_satatus == "PENDING")
      .filter(
        (item) =>
          item.sapati.sapati_satatus == "APPROVED" &&
          !item.sapati.confirm_settlement
      )
      .map((item) => ({
        user_id: item.user_id,
        sapati_id: item.sapati_id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        // fullName: item.user.fullName,
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
        phone_number: item.user.phone_number,
        fullName: item.user.fullName,
      }));
    const sapatiGiven = lendings

      // .filter((item) => item.sapati.sapati_satatus == "PENDING")
      .filter(
        (item) =>
          item.sapati.sapati_satatus == "APPROVED" &&
          !item.sapati.confirm_settlement
      )
      .map((item) => ({
        user_id: item.user_id,
        sapati_id: item.sapati_id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        // fullName: item.user.fullName,
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
        phone_number: item.user.phone_number,
        fullName: item.user.fullName,
      }));

    let data = [...sapatiTaken, ...sapatiGiven];

    console.log(lendings);

    console.log(data); // Print the original data for reference

    const ids: any[] = [];
    const userData: any[] = [];

    // Loop through the data to obtain unique creatorIds
    for (const item of data) {
      if (!ids.includes(item.creatorId)) {
        ids.push(item.creatorId);
      }
    }

    // Now, iterate over the unique creatorIds
    for (const id of ids) {
      // Initialize total amount for this creatorId
      let totalAmount = 0;

      // Loop through data to aggregate amounts for the current creatorId
      for (const item of data) {
        if (item.creatorId === id) {
          // Adjust amount based on sapati_status
          if (item.status == "Borrowed") {
            totalAmount -= item.amount;
          } else if (item.status == "Lent") {
            totalAmount += item.amount;
          }
        }
        console.log(totalAmount);
      }

      // Find the first item with this creatorId to include additional data
      const firstItem = data.find((item) => item.creatorId === id);

      // Push the aggregated data for this creatorId to userData array
      userData.push({
        creatorId: id,
        totalAmount: totalAmount,
        user_id: firstItem?.user_id,
        first_name: firstItem?.first_name,
        last_name: firstItem?.last_name,
        isverified: firstItem?.isverified,
        created_at: firstItem?.created_at,
        // status: firstItem?.status,
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

    data = userData;
    data
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(parseInt(pgnum) * pgsize, (parseInt(pgnum) + 1) * pgsize);

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
