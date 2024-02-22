
import Credentials from "next-auth/providers/credentials"

import type { NextAuthConfig } from "next-auth"
import { loginSchema } from "./schemas"

import bcrypt from "bcryptjs"
import { getAdminByEmail } from "./lib/admin"

export default {
  providers: [
    Credentials({
        async authorize(credentials){
            const validateFeilds=await loginSchema.safeParse(credentials);
            if(validateFeilds.success) {
                const {email,password}=validateFeilds.data;
                const user=await getAdminByEmail(email);
                if(!user){
                    return null;
                }

                const matchPassword=bcrypt.compare(password, user.password);

                if(!matchPassword) return null;

                return user
            }

            return null;

        }
    })
],
} satisfies NextAuthConfig