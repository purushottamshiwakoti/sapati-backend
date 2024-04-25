import { Twilio } from "twilio";
import { getUserByPhone } from "./user";
import prismadb from "./prismadb";
import axios from "axios";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const authToken = "process.env.TWILIO_AUTH_TOKEN";
const client = new Twilio(accountSid, authToken);

export const sendSms = async (country_code:any,to: any, body: any, phone: number) => {
    try {
        console.log(country_code=="+977");
        const user = await getUserByPhone(phone);
        if (user) {
            // Checking if user.tokensCreatedDate is not null before accessing .getDate()
            if (user.tokensCreatedDate && user.tokensCreatedDate.getDate() < new Date().getDate()) {
                await prismadb.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        tokensNumber: 0,
                        tokensCreatedDate: new Date()
                    }
                })
            }

            if (user.tokensNumber && user.tokensNumber >= 3) {
                return { error: "You can only request 3 OTPs per day" };
            }
        }
        // Sending SMS

        
        const res=   await axios.post(
            "https://sms.aakashsms.com/sms/v3/send/",
            {
              auth_token: process.env.AAKASH_AUTH_TOKEN,
              to: to,
              text: body,
            }
          );

          console.log(res);

        // if(country_code=="+977"){

        //  const res=   await axios.post(
        //         "https://sms.aakashsms.com/sms/v3/send/",
        //         {
        //           auth_token: process.env.AAKASH_AUTH_TOKEN,
        //           to: to,
        //           text: body,
        //         }
        //       );

        //       console.log(res);

             
        // }else{

        //     const message = await client.messages
        //         .create({
        //             from: "+15168149873",
        //             to: `${country_code}${to}`,   
        //             body: body,
        //         })
        //         .then((message) => console.log(message  ));
        // }


        // Updating user's tokensNumber and tokensCreatedDate
        if (user) {
            await prismadb.user.update({
                where: {
                    id: user.id
                },
                data: {
                    tokensNumber: {
                        increment: 1 // Correct syntax
                    },
                    tokensCreatedDate: new Date()
                }
            })
        }

        return {
            success: "Successfully sent SMS"
        };
    } catch (error) {
        console.log(error)
        return {
            error: "Something went wrong"
        };
    }
}
