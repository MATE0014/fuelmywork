import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const client = await clientPromise
          const users = client.db().collection("users")

          // Find user by email
          const user = await users.findOne({ email: credentials.email })

          if (!user || !user.password) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            username: user.username,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      // Add user id to session
      if (session?.user) {
        if (user?.id) {
          session.user.id = user.id
        } else if (token?.sub) {
          session.user.id = token.sub
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // This runs after successful OAuth sign in
      console.log("User signed in:", { user, account, profile })
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt", // Changed to JWT for credentials provider
  },
})

export { handler as GET, handler as POST }
