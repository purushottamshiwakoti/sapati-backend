import { sendNotification } from "@/lib/notification";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const title = "hAWA";
    const body = "pOINT";

    const send = await sendNotification(
      "ftLzox4kRq-4rRgqVRycNa:APA91bEXiZXcPliX9Tjxd59SL6O_iNDC3yiLAGKI_i9nvopx-7p-psLCF3p98svf7MyAaJ5GTfKJBKzENz5l-uAEs_i_ZvLD9PqwN1BIQ1px1zntWOKdiAxmS4inbwH8e25D_S5VwFdU",
      title,
      body
    );

    return NextResponse.json({ message: "yes" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "sdnbnbdsnbds" }, { status: 500 });
  }
}
