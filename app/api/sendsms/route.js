import { NextResponse } from "next/server";
import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

export async function GET() {
  try {
    const message = await client.verify.v2
      .services("VA13360a0a728700ca6328138eac68b5ec")
      .verifications.create({ to: "+9779869304327", channel: "call" })
      .then((verification) => console.log(verification.sid));

    console.log(message);
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "success no", error }, { status: 200 });
  }
}
