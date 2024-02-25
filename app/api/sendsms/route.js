import { NextResponse } from "next/server";
import { Twilio } from "twilio";

const accountSid = "ACb878a364fab15e05f8c739ea219523bb";
const authToken = "19a1fdf6494d6961210e6f3db6654bef";
const client = new Twilio(accountSid, authToken);

export async function GET() {
  try {
    const message = await client.messages
      .create({
        from: "+15168149873",
        to: "+9779869304327",
        body: "Yout otp is 8909899 Please verify it",
      })
      .then((message) => console.log(message.sid));

    console.log(message);
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "success no", error }, { status: 200 });
  }
}
