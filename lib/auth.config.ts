import type { NextAuthConfig } from "next-auth";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL ?? "";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/verify",
    error: "/sign-in",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    signIn({ user }) {
      if (!ALLOWED_EMAIL) return false;
      return user.email === ALLOWED_EMAIL;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
