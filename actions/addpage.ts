"use server"

import { privacyformSchema } from "@/components/forms/add-privacy-policy-form";
import { termsFormSchema } from "@/components/forms/add-terms-form";
import prismadb from "@/lib/prismadb";
import * as z from "zod"

export const addTerms=async(values:any,id:string)=>{
    try {
       
        const {title,description}=values

        await prismadb.terms.update({
            where:{
                id
            },    
          data:{
            title,
            description
          }
        });

        return {success:"Successfully updated terms page"}
    } catch (error) {
        return {error:"Something went wrong"}
    }

}

export const addPrivacy=async(values:any,id:string)=>{
    try {
        const {title,description}=values

        await prismadb.privacy.update({
            where:{
                id
            },
          data:{
            title,
            description
          }
        })
        return {success:"Successfully updated privacy page"}

    } catch (error) {
        console.log(error);
        return {error:"Something went wrong"}
    }

}