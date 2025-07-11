"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/AuthContext"

export function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
