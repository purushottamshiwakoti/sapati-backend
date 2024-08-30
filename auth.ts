import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth-config";
import { getAdminById } from "./lib/admin";
import prismadb from "./lib/prismadb";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  callbacks: {
    // trustHost: true,
    async signIn({ user }) {
      if (!user) return false;
      const existingUser = await getAdminById(user.id as string);
      if (!existingUser) return false;
      // if(existingUser.twoFactorEnabled) return false;

      return true;
    },
    async session({ session, token }) {
      session.user.name = token.name;
      session.user.id = token.sub!;
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getAdminById(token.sub as string);
      if (!existingUser) return null;
      token.name = existingUser.full_name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.id = existingUser.id;

      return token;
    },
  },

  adapter: PrismaAdapter(prismadb),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  ...authConfig,
});
