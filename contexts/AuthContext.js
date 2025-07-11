"use client"

import { createContext, useContext } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession()

  const login = async (provider = "github") => {
    await signIn(provider, { callbackUrl: "/dashboard" })
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const value = {
    user: session?.user || null,
    login,
    logout,
    loading: status === "loading",
    isAuthenticated: !!session?.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
