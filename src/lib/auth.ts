import { DefaultSession, NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      mode?: "fun" | "regular";
    } & DefaultSession["user"];
  }
}

// Fun Mode: Shared default user ID for collective experience
export const FUN_MODE_USER_ID = "00000000-0000-4000-8000-000000000000";

export const authOptions: NextAuthOptions = {
  debug: false,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      id: "fun-mode",
      name: "Fun Mode",
      credentials: {},
      async authorize() {
        // Fun Mode: Auto-login without credentials
        return {
          id: FUN_MODE_USER_ID,
          name: "Fun Mode User",
          email: "fun-mode@example.com",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-ins, ensure the user exists in our database
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!existingUser) {
            // Create new user record with proper ID
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
              }
            });
          }

          // Update the user object with the database ID
          user.id = existingUser.id;
        } catch (error) {
          console.error("Error creating user:", error);
          // Continue with sign-in even if user creation fails
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "fun-mode") {
          // Fun Mode: Use shared user ID for collective experience
          token.userId = FUN_MODE_USER_ID;
          token.mode = "fun";
        } else {
          // Regular Mode: Use individual user ID
          token.userId = user.id;
          token.mode = "regular";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.mode = token.mode as "fun" | "regular";

        if (token.mode === "fun") {
          session.user.name = "Fun Mode User";
        }
      }
      return session;
    },
  },
};
