import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken =  process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);


export const sendSms=async(to:any,body:any)=>{
    try {

        console.log(to,body);
        
        const message = await client.messages
        .create({
          from: "+15168149873",
          to: `+${to}`,
          body: body,
        })
        .then((message) => console.log(message.sid));

        return message;
    } catch (error) {
        console.log(error)
        return error;
    }
}