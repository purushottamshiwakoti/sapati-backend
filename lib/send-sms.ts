import { Twilio } from "twilio";
import { getUserByPhone } from "./user";
import prismadb from "./prismadb";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken =  process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);


export const sendSms=async(to:any,body:any,phone:number)=>{
    try {
        const user=await getUserByPhone(phone);

        console.log(user);

        console.log(user?.tokensCreatedDate!.getDate()! <new Date().getDate())
        if(user?.tokensCreatedDate!.getDate()! <new Date().getDate()){
            await prismadb.user.update({
                where:{
                    id:user?.id!
                },
                data:{
                    tokensNumber:0,
                    tokensCreatedDate:new Date()
                }
            })
        }

        if(user?.tokensNumber&&user?.tokensNumber>=3){
            return {error:"Yo can only request 3 otp per day"}
        }
        
        const message = await client.messages
        .create({
          from: "+15168149873",
          to: `+${to}`,
          body: body,
        })
        .then((message) => console.log(message.sid));

        await prismadb.user.update({
            where: {
                id: user!.id
            },
            data: {
                tokensNumber: {
                    increment: 1  // Correct syntax
                },
                tokensCreatedDate: new Date()
            }
        })
        console.log(user)
        return {
            success:"Successfully sent SMS"
        };
    } catch (error) {
        console.log(error)
        return {
            error:"Something went wrong"
        };
    }
}