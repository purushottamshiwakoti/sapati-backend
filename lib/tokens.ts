
import crypto from "crypto";
import { getVerificationTokenByPhone } from "./user";
import prismadb from "./prismadb";

export const generatePhoneVerificationToken=async(phone_number:number)=>{

    console.log(phone_number)
    const token=crypto.randomInt(100_000,1_000_000).toString();
    console.log(token)
    const expires=new Date(new Date().getTime()+5*60*1000);
    console.log(expires)
    const existingToken=await getVerificationTokenByPhone(phone_number)
    console.log(existingToken);
    if(existingToken){
        await prismadb.verifyPhoneNumber.delete({
            where:{
                id: existingToken.id
            }
        });
    }

    const createToken=await prismadb.verifyPhoneNumber.create({
        data:{
            phone_number,
            expires,
            token
        }
    });

    console.log(createToken);



    return token

}