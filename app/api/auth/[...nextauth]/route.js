import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user id to session
      if (session?.user && user?.id) {
        session.user.id = user.id
      }
      return session
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
    strategy: "database",
  },
})

export { handler as GET, handler as POST }
