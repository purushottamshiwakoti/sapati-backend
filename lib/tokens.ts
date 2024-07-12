import crypto from "crypto";
import { getUserById, getVerificationTokenByPhone } from "./user";
import prismadb from "./prismadb";

import { v4 as uuidv4 } from "uuid";

export const generatePhoneVerificationToken = async (phone_number: number) => {
  try {
    console.log(phone_number);
    const token = crypto.randomInt(100_000, 1_000_000).toString();
    console.log(token);
    const expires = new Date(new Date().getTime() + 5 * 60 * 1000);
    console.log(expires);
    const existingToken = await getVerificationTokenByPhone(phone_number);
    if (existingToken) {
      await prismadb.verifyPhoneNumber.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const createToken = await prismadb.verifyPhoneNumber.create({
      data: {
        phone_number,
        expires,
        token,
      },
    });

    console.log(createToken);

    return token;
  } catch (error) {
    console.log(error);
  }
};

export const getPhoneNumberToken = async (
  token: string,
  phone_number: number
) => {
  try {
    console.log(token);
    const getToken = await prismadb.verifyPhoneNumber.findFirst({
      where: {
        token,
      },
    });

    return getToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateBearerToken = async (id: string) => {
  console.log(id);
  try {
    // const existingToken=await prismadb.bearerToken.findUnique({
    //     where:{
    //         user_id:id,
    //     }
    // })
    // if(existingToken){
    //     await prismadb.bearerToken.delete({
    //         where:{
    //             id:existingToken.id
    //         }
    //     })
    // }

    const token = uuidv4();
    console.log(token);

    try {
      await prismadb.bearerToken.create({
        data: {
          token,
          user_id: id,
        },
      });
    } catch (error) {
      console.log(error);
    }

    return token;
  } catch (error) {
    console.log(error);
    return null;
  }
};
