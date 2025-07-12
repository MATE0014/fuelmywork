"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Menu, X } from "lucide-react"
import { useState } from "react"

const Navbar = () => {
  const { user, logout, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-gray-950 text-white border-b border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="/fmw-logo.png"
                alt="FuelMyWork Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <a
              href="/"
              className="font-outfit font-bold text-lg sm:text-xl bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
            >
              fuelmywork
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-300 hover:text-white transition-colors font-outfit">
              Home
            </a>
            <a href="/about" className="text-gray-300 hover:text-white transition-colors font-outfit">
              About
            </a>

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
                  <span className="text-sm text-gray-300 hidden lg:block">Hi, {user.name?.split(" ")[0]}</span>
                </div>
                <a href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-outfit">Dashboard</Button>
                </a>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-400 text-red-400 hover:bg-gray-800 hover:text-red-500 hover:border-red-600 bg-transparent font-outfit"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <a href="/login">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent font-outfit "
                >
                  Login
                </Button>
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
          <div className="px-4 py-6 space-y-4">
            <a
              href="/"
              className="block text-gray-300 hover:text-white transition-colors font-outfit py-2"
              onClick={closeMobileMenu}
            >
              Home
            </a>
            <a
              href="/about"
              className="block text-gray-300 hover:text-white transition-colors font-outfit py-2"
              onClick={closeMobileMenu}
            >
              About
            </a>

            {loading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : user ? (
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src={user.image || "/placeholder.svg?height=40&width=40"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-gray-600"
                  />
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <a href="/dashboard" onClick={closeMobileMenu}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-outfit w-full my-4">Dashboard</Button>
                </a>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent font-outfit w-full"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-700">
                <a href="/login" onClick={closeMobileMenu}>
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent font-outfit w-full"
                  >
                    Login
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
