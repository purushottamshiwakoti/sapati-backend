import { NextResponse } from "next/server";
import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

export async function GET() {
  try {
    const message = await client.messages
      .create({
        from: "+9779869304327",
        to: "+9779849390103",
        body: "La hai paisa chaiyo malai",
      })
      .then((message) => console.log(message.sid));

    console.log(message);
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "success no", error }, { status: 200 });
  }
}
