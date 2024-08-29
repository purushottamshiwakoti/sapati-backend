import { sendNotification } from "@/lib/notification";
import prismadb from "@/lib/prismadb";
import { getSapatiById } from "@/lib/sapati";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, params: any) {
  const nepalTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kathmandu",
  });

  try {
    const token = await req.headers;
    console.log("ssbsb");

    const bearerToken = token.get("Authorization")?.split(" ")[1];

    const existingToken = await verifyBearerToken(bearerToken);
    if (!existingToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const id = params.params.id;
    const sapati = await getSapatiById(id);

    if (!sapati) {
      return NextResponse.json({ message: "No sapati found" }, { status: 404 });
    }
    const { status, decline_reason, change_reason, changed_remarks, amount } =
      await req.json();
    // console.log(status,decline_reason,change_reason,changed_remarks)
    const borrowerId = sapati.borrowings?.user_id;
    const lenderId = sapati.lendings?.user_id;

    // if (existingToken.user_id !== lenderId && existingToken.user_id !== borrowerId) {
    //     return NextResponse.json({ message: "No sapati found" }, { status: 403 });
    // }

    const user: any = await getUserById(sapati.created_by as string);
    if (existingToken.user_id == lenderId || borrowerId) {
      if (status == "APPROVED") {
        const newSapati = await prismadb.sapati.update({
          where: {
            id: sapati.id,
          },
          data: {
            sapati_satatus: "APPROVED",
            request_change_date: new Date(),
          },
        });

        try {
          const notification = await prismadb.notifications.create({
            data: {
              sapati_id: sapati.id,
              status: "APPROVED",
              user_id: user.id,
              created_at: new Date(nepalTime),
            },
          });
        } catch (error) {}
        if (user.device_token && user.notification) {
          await sendNotification(
            user.device_token,
            "Sapati approved",
            `${sapati.fullName} approved sapati`
          );
        }
        return NextResponse.json({
          message: "Successfully approved request",
          newSapati,
          status: 200,
        });
      }
      if (status == "DECLINED") {
        const newSapati = await prismadb.sapati.update({
          where: {
            id: sapati.id,
          },
          data: {
            sapati_satatus: "DECLINED",
            decline_reason,
            request_change_date: new Date(),
          },
        });

        try {
          const notification = await prismadb.notifications.create({
            data: {
              sapati_id: sapati.id,
              status: "REJECTED",
              user_id: user.id,
              created_at: new Date(nepalTime),
            },
          });
        } catch (error) {}
        if (user.device_token && user.notification) {
          await sendNotification(
            user.device_token,
            "Sapati rejected",
            `${sapati.fullName} rejected sapati`
          );
        }

        return NextResponse.json({
          message: "Successfully declined request",
          newSapati,
          status: 200,
        });
      }
      if (status == "CHANGE") {
        const newSapati = await prismadb.sapati.update({
          where: {
            id: sapati.id,
          },
          data: {
            sapati_satatus: "DECLINED",
            change_reason,
            request_change_date: new Date(),
          },
        });
        try {
          const notification = await prismadb.notifications.create({
            data: {
              sapati_id: sapati.id,
              status: "CHANGE",
              user_id: user.id,
              created_at: new Date(nepalTime),
            },
          });
        } catch (error) {}
        if (user.device_token && user.notification) {
          await sendNotification(
            user.device_token,
            "Sapati change request",
            `${sapati.fullName} requested change insapati`
          );
        }
        return NextResponse.json({
          message: "Successfully requested to change request",
          newSapati,
          status: 200,
        });
      }

      if (status === "CHANGED") {
        await prismadb.sapati.update({
          where: {
            id: sapati.id,
          },
          data: {
            amount,
            changed_remarks,
            changed_amount: sapati.amount,
          },
        });
        return NextResponse.json({
          message: "Successfully updated change request",
          status: 200,
        });
      }
    } else {
      return NextResponse.json(
        { message: "You cannot perform this action" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
