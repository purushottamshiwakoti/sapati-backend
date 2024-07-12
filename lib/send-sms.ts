import { Twilio } from "twilio";
import { getUserByPhone } from "./user";
import prismadb from "./prismadb";
import axios from "axios";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

export const sendSms = async (
  country_code: string,
  to: string,
  body: string,
  phone: number
) => {
  try {
    console.log(country_code === "+977");
    const user = await getUserByPhone(phone);
    if (user) {
      const today = new Date().getDate();
      const tokensCreatedDate = user.tokensCreatedDate
        ? user.tokensCreatedDate.getDate()
        : null;

      if (tokensCreatedDate !== today) {
        await prismadb.user.update({
          where: { id: user.id },
          data: {
            tokensNumber: 0,
            tokensCreatedDate: new Date(),
          },
        });
      }
      console.log(user.tokensCreatedDate == new Date());
      console.log(user.tokensCreatedDate?.getDate());
      console.log(new Date().getDate());

      if (
        user.tokensNumber &&
        user.tokensNumber >= 3 &&
        user.tokensCreatedDate?.getDate() == new Date().getDate()
      ) {
        return { error: "You can only request 3 OTPs per day" };
      }
    }

    if (country_code === "+977") {
      const res = await axios.post("https://sms.aakashsms.com/sms/v3/send/", {
        auth_token: process.env.AAKASH_AUTH_TOKEN,
        to: to,
        text: body,
      });

      console.log(res.data);
    } else {
      const message = await client.messages.create({
        from: "+15168149873",
        to: `${country_code}${to}`,
        body: body,
      });

      console.log(message);
    }

    if (user) {
      await prismadb.user.update({
        where: { id: user.id },
        data: {
          tokensNumber: {
            increment: 1,
          },
          tokensCreatedDate: new Date(),
        },
      });
    }

    return {
      success: "Successfully sent SMS",
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      error: "Something went wrong",
    };
  }
};
