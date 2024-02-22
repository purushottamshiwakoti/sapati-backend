import { auth } from "@/auth"

export const AuthUser=async()=>{
    const session=await auth()
    return session?.user;

}