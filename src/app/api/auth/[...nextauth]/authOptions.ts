import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/dbConfig/dbConfig";
import UserModel, { IUser } from "@/models/userModel";
import type { AuthOptions, Session, User, Account } from "next-auth";
import type { JWT } from "next-auth/jwt";
import bcryptjs from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        const user = await UserModel.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("User does not exist");
        }
        if (!user.password) {
          throw new Error("Please login with Google");
        }
        const isPasswordCorrect = await bcryptjs.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }
        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    // ✅ Create user in DB if not exists
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === "credentials") {
        return true;
      }

      await dbConnect();

      const existingUser = await UserModel.findOne({ email: user.email });
      if (!existingUser) {
        await UserModel.create({
          name: user.name,
          email: user.email,
          isVerified: true, // OAuth users are verified implicitly
        });
      }

      return true;
    },

    // ✅ Add user ID to JWT (and handle deleted user case)
    async jwt({ token }) {
      await dbConnect();

      const userInDb = await UserModel.findOne<IUser>({ email: token.email });

      if (!userInDb) {
        // 🔴 Token will still be returned, but without id
        delete token.id;
      } else {
        token.id = userInDb._id.toString(); // ✅ No TS error now
      }

      return token;
    },

    // ✅ Safely expose user ID in session
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.id) {
        session.user.id = token.id as string;
      } else {
        // Don't return null — this breaks NextAuth's expected types
        // Instead, just don't set session.user.id
      }

      return session;
    },

    // ✅ Safe redirect
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
};