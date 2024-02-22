"use server"

import { z } from "zod";


import { addUserSchema, changePasswordSchema, editUserSchema, loginSchema } from "@/schema";

import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getAdminByEmail, getAdminById } from "@/lib/admin";
import prismadb from "@/lib/prismadb";

export const login=async(values: z.infer<typeof loginSchema>,callbackUrl?:string|null)=>{
    const validateFeilds=loginSchema.safeParse(values);
    
    if(!validateFeilds.success) return {error:"Invalid feilds"}
    
    const {email,password}=validateFeilds.data;
    const user=await getAdminByEmail(email);
    if(!user){
        return {error:"Invalid credentials"}
    }
    
    const comparePassword=await bcrypt.compare(password,user.password);
    
    if(!comparePassword){
        return {error:"Invalid credentials"}
    
    }
    
    try {
        await signIn("credentials",{email,password,
        redirectTo: callbackUrl||DEFAULT_LOGIN_REDIRECT
        })
        
       } catch (error) {
        if(error instanceof AuthError){
            switch(error.type){
                case "CredentialsSignin":
                    return {
                        error:"Invalid credentials!"
                    }
                    default:
                        return {
                            error:"Invalid credentials!"
                        }
                }
            }
            throw error
        }
       }
    
export const addUser=async(values: z.infer<typeof addUserSchema>)=>{
    const validateFeilds=addUserSchema.safeParse(values);
    
    if(!validateFeilds.success) return {error:"Invalid feilds"}
    
    const {email,password,fullName}=validateFeilds.data;
    const user=await getAdminByEmail(email);
    if(user){
        return {error:"User already exists"}
    }
    
    const hashedPassword=await bcrypt.hash(password,10);
    
    await prismadb.admin.create({
        data:{
            full_name:fullName,
            email,
            password:hashedPassword
        }
    });

    return{
        success:"Successfully added user"
    }

 
       }
export const editUser=async(values: z.infer<typeof editUserSchema>,id:string)=>{
    const validateFeilds=editUserSchema.safeParse(values);
    
    if(!validateFeilds.success) return {error:"Invalid feilds"}

    const {email}=validateFeilds.data;
    
    const user=await getAdminById(id);
    if(!user){
        return {error:"User doesnot exists"}
    }
    
   
    
    await prismadb.admin.update({
        where:{
            id
        },
        data:{
           ...values
        }
    });

    return{
        success:"Successfully updated user"
    }

 
       }
export const deleteUser=async(id:string)=>{
    

    
    const user=await getAdminById(id);
    if(!user){
        return {error:"User doesnot exists"}
    }
    
   
    
    await prismadb.admin.delete({
        where:{
            id
        },
       
    });

    return{
        success:"Successfully deleted user"
    }

 
       }
    

       
   export const logout=()=>{
    return signOut()

   }

   export const changePassword=async(values: z.infer<typeof changePasswordSchema>,email:string)=>{

   

    try {
        const validateFeilds=changePasswordSchema.safeParse(values);
        if(!validateFeilds.success) {
            return {error:"Invalid feilds"}
        }
    const {confirmPassword,newPassword,password}=validateFeilds.data;
    if(newPassword!==confirmPassword){
        return{error:"Password didn't matched"}
    }
        const user=await getAdminByEmail(email);
        if(!user) return {error:"User doesnot exists"}
    
        const checkPassword=await bcrypt.compare(password,user.password);
        if(!checkPassword) return {error:"Your password didn't matched"}

const hashedPassword=await bcrypt.hash(newPassword,10)

        await prismadb.admin.update({
            where:{
                email
            },
            data:{
                password:hashedPassword
            }
        })
        return {success:"Successfully updated password"}
    } catch (error) {
        return {error:"Something went wrong"}
    }

   }
    