import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
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
          const users = client.db("fuelmywork").collection("users")
          const user = await users.findOne({ email: credentials.email })

          console.log("[v0] Login attempt for:", credentials.email)
          console.log("[v0] User found:", !!user)

          if (!user) {
            console.log("[v0] User not found")
            return null
          }

          if (!user.password) {
            console.log("[v0] User has no password (OAuth user)")
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log("[v0] Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("[v0] Invalid password")
            return null
          }

          if (!user.emailVerified) {
            console.log("[v0] Email not verified")
            throw new Error("Please verify your email before signing in.")
          }

          console.log("[v0] Login successful")
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            provider: "credentials",
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.provider = account?.provider || user.provider || "unknown"
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.provider = token.provider
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          const client = await clientPromise
          const users = client.db("fuelmywork").collection("users")

          const existingUser = await users.findOne({
            $or: [{ email: user.email }, { githubId: profile.id.toString() }],
          })

          if (!existingUser) {
            const newUser = await users.insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: true,
              provider: "github",
              githubId: profile.id.toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
            })

            user.id = newUser.insertedId.toString()
          } else {
            await users.updateOne(
              { _id: existingUser._id },
              {
                $set: {
                  name: user.name,
                  image: user.image,
                  updatedAt: new Date(),
                },
              },
            )
            user.id = existingUser._id.toString()
          }
        } catch (error) {
          console.error("GitHub sign-in error:", error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
