"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

const Navbar = () => {
  const { user, logout, loading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="bg-gray-950 text-white px-6 flex justify-between items-center h-16 border-b border-gray-800">
      {/* Logo/Branding */}
      <div className="flex items-center space-x-3">
        {/* Logo */}
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
            <path
              d="M12 16L13.09 20.26L18 21L13.09 21.74L12 26L10.91 21.74L6 21L10.91 20.26L12 16Z"
              fill="currentColor"
              opacity="0.7"
            />
          </svg>
        </div>
        <a
          href="/"
          className="logo font-outfit font-bold text-xl bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
        >
          fuelmywork
        </a>
      </div>

      {/* Navigation Links */}
      <ul className="flex items-center gap-6">
        <li>
          <a href="/" className="text-gray-300 hover:text-white transition-colors font-outfit">
            Home
          </a>
        </li>
        <li>
          <a href="/about" className="text-gray-300 hover:text-white transition-colors font-outfit">
            About
          </a>
        </li>
        <li>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-400">Loading...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={user.image || "/placeholder.svg?height=32&width=32"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-gray-600"
                />
                <span className="text-sm text-gray-300">Hi, {user.name?.split(" ")[0]}</span>
              </div>
              <a href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-outfit">Dashboard</Button>
              </a>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent font-outfit"
              >
                Logout
              </Button>
            </div>
          ) : (
            <a href="/login">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent font-outfit"
              >
                Login
              </Button>
            </a>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
