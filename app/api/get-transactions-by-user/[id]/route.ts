import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, params: any) {
  try {
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

    const user = await getUserById(existingToken.user_id);
    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    const status = req.nextUrl.searchParams.get("status");
    const findUser = await getUserById(id);

    if (!findUser) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    const pgnum: any = req.nextUrl.searchParams.get("pgnum") ?? 0;
    const pgsize: number = 10;

    let borrowings = await prismadb.borrowings.findMany({
      where: {
        user_id: findUser.id,
      },
      include: {
        sapati: true,
        user: true,
      },
    });

    let lendings = await prismadb.lendings.findMany({
      where: {
        user_id: findUser.id,
      },
      include: {
        sapati: true,
        user: true,
      },
    });

    borrowings = borrowings.filter(
      (item) =>
        (item.sapati.created_by == id &&
          item.sapati.created_for == existingToken.user_id) ||
        (item.sapati.created_by == existingToken.user_id &&
          item.sapati.created_for == id)
    );

    lendings = lendings.filter(
      (item) =>
        (item.sapati.created_by == id &&
          item.sapati.created_for == existingToken.user_id) ||
        (item.sapati.created_by == existingToken.user_id &&
          item.sapati.created_for == id)
    );

    for (const item of borrowings) {
      const phone = parseInt(item.sapati.phone);
      if (!isNaN(phone)) {
        const borrower_user = await getUserByPhone(phone);
        item.sapati.type = "LENDED" ? "BORROWED" : "LENDED";
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
      const phone = parseInt(item.sapati.phone);
      if (!isNaN(phone)) {
        const borrower_user = await getUserByPhone(phone);
        item.sapati.type = "BORROWED" ? "LENDED" : "BORROWED";
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

    const sapatiTaken = borrowings
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((item) => ({
        user_id: item.user_id,
        sapati_id: item.sapati_id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        fullName: item.user.fullName,
        isverified: item.user.is_verified,
        created_at: item.sapati.created_at,
        status: item.sapati.type,
        sapati_status: item.sapati.sapati_satatus,
        confirm_settlement: item.sapati.confirm_settlement,
        amount: item.sapati.amount,
        image: item.user.image,
        remarks: item.sapati.remarks,
        taken_date: item.sapati.taken_date,
        return_date: item.sapati.return_date,
        request_change_date: item.sapati.request_change_date,
        changed_remarks: item.sapati.changed_remarks,
        decline_reason: item.sapati.decline_reason,
        change_reason: item.sapati.change_reason,
        created_by: item.sapati.created_by,
        currentUser: existingToken.user_id,
        settled_date: item.sapati.settled_date,
        updated_at: item.sapati.updated_at,
      }));

    const sapatiGiven = lendings
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((item) => ({
        user_id: item.user_id,
        sapati_id: item.sapati_id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        fullName: item.user.fullName,
        isverified: item.user.is_verified,
        created_at: item.sapati.created_at,
        status: item.sapati.type,
        sapati_status: item.sapati.sapati_satatus,
        confirm_settlement: item.sapati.confirm_settlement,
        amount: item.sapati.amount,
        image: item.user.image,
        remarks: item.sapati.remarks,
        taken_date: item.sapati.taken_date,
        return_date: item.sapati.return_date,
        changed_remarks: item.sapati.changed_remarks,
        decline_reason: item.sapati.decline_reason,
        change_reason: item.sapati.change_reason,
        request_change_date: item.sapati.request_change_date,
        created_user_name: item.sapati.created_user_name,
        created_by: item.sapati.created_by,
        currentUser: existingToken.user_id,
        settled_date: item.sapati.settled_date,
        updated_at: item.sapati.updated_at,
      }));
    let data = [...sapatiGiven, ...sapatiTaken];

    if (status == "activebook") {
      const given = sapatiGiven.filter(
        (item) => !item.confirm_settlement && item.sapati_status != "DECLINED"
      );

      const taken = sapatiTaken.filter(
        (item) => !item.confirm_settlement && item.sapati_status != "DECLINED"
      );

      let activedata = [...given, ...taken];

      // Sort the data
      activedata = activedata.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Paginate the data
      const slicedData = activedata.slice(
        parseInt(pgnum) * pgsize,
        (parseInt(pgnum) + 1) * pgsize
      );

      return NextResponse.json(
        { message: "Successfully fetched transactions", data: slicedData },
        { status: 200 }
      );
    }

    //  all start
    if (status == "all") {
      const given = sapatiGiven.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // .filter((item) => item.confirm_settlement == true);
      const taken = sapatiTaken.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // .filter((item) => item.confirm_settlement == true);
      let activedata = [...given, ...taken];

      // Sort the data
      activedata = activedata.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Paginate the data
      const slicedData = activedata.slice(
        parseInt(pgnum) * pgsize,
        (parseInt(pgnum) + 1) * pgsize
      );

      return NextResponse.json(
        { message: "Successfully fetched transactions", data: slicedData },
        { status: 200 }
      );
    }
    // all end

    // lend start
    if (status == "lend") {
      const given = sapatiGiven
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        // .filter((item) => item.status == "LENDED");
        .filter((item) => item.status == "BORROWED");
      const taken = sapatiTaken
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        // .filter((item) => item.status == "LENDED");
        .filter((item) => item.status == "BORROWED");

      let activedata = [...given, ...taken];

      // Sort the data
      activedata = activedata.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Paginate the data
      const slicedData = activedata.slice(
        parseInt(pgnum) * pgsize,
        (parseInt(pgnum) + 1) * pgsize
      );

      return NextResponse.json(
        { message: "Successfully fetched transactions", data: slicedData },
        { status: 200 }
      );
    }
    // lend end

    // borrowed start
    if (status == "borrowed") {
      const given = sapatiGiven
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        // .filter((item) => item.status == "BORROWED");
        .filter((item) => item.status == "LENDED");
      // .filter((item) => item.confirm_settlement == true);
      const taken = sapatiTaken
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        // .filter((item) => item.status == "BORROWED");
        .filter((item) => item.status == "LENDED");

      // .filter((item) => item.confirm_settlement == true);
      let activedata = [...given, ...taken];

      // Sort the data
      activedata = activedata.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Paginate the data
      const slicedData = activedata.slice(
        parseInt(pgnum) * pgsize,
        (parseInt(pgnum) + 1) * pgsize
      );

      return NextResponse.json(
        { message: "Successfully fetched transactions", data: slicedData },
        { status: 200 }
      );
    }
    // borrowed end

    if (status == "settled") {
      const given = sapatiGiven
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .filter((item) => item.confirm_settlement == true);
      const taken = sapatiTaken
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .filter((item) => item.confirm_settlement == true);
      let activedata = [...given, ...taken];

      // Sort the data
      activedata = activedata.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Paginate the data
      const slicedData = activedata.slice(
        parseInt(pgnum) * pgsize,
        (parseInt(pgnum) + 1) * pgsize
      );

      return NextResponse.json(
        { message: "Successfully fetched transactions", data: slicedData },
        { status: 200 }
      );
    }

    if (status == "rejected") {
      const given = sapatiGiven
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .filter((item) => item.sapati_status == "DECLINED");
      const taken = sapatiTaken
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .filter((item) => item.sapati_status == "DECLINED");
      let activedata = [...given, ...taken];

      // Sort the data
      activedata = activedata.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Paginate the data
      const slicedData = activedata.slice(
        parseInt(pgnum) * pgsize,
        (parseInt(pgnum) + 1) * pgsize
      );

      return NextResponse.json(
        { message: "Successfully fetched transactions", data: slicedData },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error },
      { status: 500 }
    );
  }
}
