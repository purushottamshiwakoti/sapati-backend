"use server"

import { z } from "zod";

import { loginSchema } from "@/lib/schema"
import { getAdminByEmail } from "@/lib/admin";

export const adminLogin=async(values: z.infer<typeof loginSchema>)=>{

    try {
        const validateFeilds=loginSchema.safeParse(values);
        if(!validateFeilds.success){
            return {error:"Invalid feilds"}
        };

        const {email,password}=validateFeilds.data;

        const existingAdmin=await getAdminByEmail(email);

        if(!existingAdmin){
            return {error:"Invalid credientials"}
        }
        if(existingAdmin.password!==password){

            return {error:"Invalid credentials"}
        }

        return {success:"Successfully logged in"}


        
    } catch (error) {
        console.log(error);
        return {error:"Something went wrong"}
    }

}