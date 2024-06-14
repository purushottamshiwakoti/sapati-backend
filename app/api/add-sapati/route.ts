import { sendNotification } from "@/lib/notification";
import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const nepalTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kathmandu",
  });

  try {
    const token = await req.headers;
    const bearerToken = token.get("Authorization")?.split(" ")[1];

    const existingToken = await verifyBearerToken(bearerToken);
    if (!existingToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const user = await getUserById(existingToken.user_id);

    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }
    let {
      fullName,
      phone,
      amount,
      taken_date,
      return_date,
      remarks,
      type,
      country_code,
    } = await req.json();
    if (phone.includes("-")) {
      phone = phone.split("-").join("");
    }

    amount = parseInt(amount);
    return_date = new Date(return_date);
    taken_date = new Date(taken_date);
    if (return_date < taken_date) {
      return NextResponse.json(
        { message: "Return date must be greater than taken data" },
        { status: 400 }
      );
    }
    const requiredFields = [
      { field: fullName, fieldName: "Full Name" },
      { field: phone, fieldName: "Phone " },
      { field: amount, fieldName: "Amount" },
      { field: taken_date, fieldName: "Taken Date" },
      //   { field: return_date, fieldName: "Return Date" },
      { field: type, fieldName: "Type" },
    ];
    const errors: any = [];

    requiredFields.forEach(({ field, fieldName }) => {
      if (!field) {
        errors.push(`${fieldName} is required`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 499 });
    }

    const sapatiUser = {
      fullName: fullName,
      amount: amount,
      taken_date: taken_date,
      return_date: return_date,
    };

    const phone_number = parseInt(phone);

    let newUser;

    const existingUser = await getUserByPhone(phone_number);

    if (country_code == null) {
      country_code = user.country_code;
    }

    if (!existingUser) {
      newUser = await prismadb.user.create({
        data: {
          phone_number,
          fullName,
          country_code,
        },
      });
    }

    if (existingUser?.id === existingToken.user_id) {
      return NextResponse.json(
        { message: "You cannot add sapati for self" },
        { status: 403 }
      );
    }

    if (type == "LENDED" && newUser !== undefined) {
      const sapati = await prismadb.sapati.create({
        data: {
          amount,
          phone,
          return_date,
          taken_date,
          fullName,
          type,
          remarks,
          created_by: existingToken.user_id,
          created_for: newUser.id,
          created_user_name: user.first_name + " " + user.last_name,
          created_user_image: user.image,
          lendings: {
            create: {
              user: {
                connect: {
                  //    id:newUser.id,
                  id: existingToken.user_id,
                },
              },
            },
          },
          borrowings: {
            create: {
              user_id: newUser.id,
              //    user_id:newUser.id
            },
          },
        },
      });
      await prismadb.notifications.create({
        data: {
          sapati_id: sapati.id,
          status: "REQUEST",
          user_id: newUser.id,
          created_at: new Date(nepalTime),
        },
      });
      return NextResponse.json(
        { message: "Successfully added lending", user: sapatiUser },
        { status: 200 }
      );
    }
    if (type == "LENDED" && existingUser !== null) {
      const sapati = await prismadb.sapati.create({
        data: {
          amount,
          phone,
          return_date,
          taken_date,
          fullName,
          type,
          remarks,
          created_by: existingToken.user_id,
          created_for: existingUser.id,
          created_user_name: user.first_name + " " + user.last_name,
          created_user_image: user.image,
          lendings: {
            create: {
              user: {
                connect: {
                  id: existingToken.user_id,
                  // id:existingUser.id
                },
              },
            },
          },
          borrowings: {
            create: {
              //  user_id:existingToken.user_id
              user_id: existingUser.id,
            },
          },
        },
      });
      await prismadb.notifications.create({
        data: {
          sapati_id: sapati.id,
          status: "REQUEST",
          user_id: existingUser.id,
          created_at: new Date(nepalTime),
        },
      });

      if (existingUser.device_token && existingUser.notification) {
        await sendNotification(
          existingUser.device_token,
          "Amount Lended",
          `${
            user.fullName ?? user.first_name
          } have lended you ${amount}. Please verify it`
        );
      }
      return NextResponse.json(
        { message: "Successfully added lending", user: sapatiUser },
        { status: 200 }
      );
    }

    if (type == "BORROWED" && newUser !== undefined) {
      const sapati = await prismadb.sapati.create({
        data: {
          amount,
          phone,
          return_date,
          taken_date,
          fullName,
          type,
          remarks,
          created_by: existingToken.user_id,
          created_for: newUser.id,
          created_user_name: user.first_name + " " + user.last_name,
          created_user_image: user.image,

          borrowings: {
            create: {
              user: {
                connect: {
                  // id:newUser.id
                  id: existingToken.user_id,
                },
              },
            },
          },
          lendings: {
            create: {
              // user_id:existingToken.user_id
              user_id: newUser.id,
            },
          },
        },
      });
      await prismadb.notifications.create({
        data: {
          sapati_id: sapati.id,
          status: "REQUEST",
          user_id: newUser.id,
          created_at: new Date(nepalTime),
        },
      });
      return NextResponse.json(
        { message: "Successfully added borrowing", user: sapatiUser },
        { status: 200 }
      );
    }

    if (type == "BORROWED" && existingUser !== null) {
      const sapati = await prismadb.sapati.create({
        data: {
          amount,
          phone,
          return_date,
          taken_date,
          fullName,
          type,
          remarks,
          created_by: existingToken.user_id,
          created_for: existingUser.id,
          created_user_name: user.first_name + " " + user.last_name,
          created_user_image: user.image,
          borrowings: {
            create: {
              user: {
                connect: {
                  //  id:existingUser.id
                  id: existingToken.user_id,
                },
              },
            },
          },
          lendings: {
            create: {
              //  user_id:existingToken.user_id
              user_id: existingUser.id,
            },
          },
        },
      });
      await prismadb.notifications.create({
        data: {
          sapati_id: sapati.id,
          status: "REQUEST",
          user_id: existingUser.id,
          created_at: new Date(nepalTime),
        },
      });
      if (existingUser.device_token && existingUser.notification) {
        await sendNotification(
          existingUser.device_token,
          "Amount Borrowed",
          `${
            user.fullName ?? user.first_name
          } have borrowed from you ${amount}. Please verify it`
        );
      }
      return NextResponse.json(
        { message: "Successfully added borrowing", user: sapatiUser },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
