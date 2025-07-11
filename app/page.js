"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Heart, Zap, Users, ArrowRight, Coffee, Gift, Star, User } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef(null)
  const router = useRouter()

  // Search creators
  useEffect(() => {
    const searchCreators = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setSearchLoading(true)
      try {
        const response = await fetch(`/api/search-creators?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.creators || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setSearchLoading(false)
      }
    }

    const timeoutId = setTimeout(searchCreators, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // If there's an exact match, go to that profile
      const exactMatch = searchResults.find(
        (creator) => creator.username.toLowerCase() === searchQuery.toLowerCase().trim(),
      )
      if (exactMatch) {
        router.push(`/${exactMatch.username}`)
      } else if (searchResults.length > 0) {
        // Go to first result
        router.push(`/${searchResults[0].username}`)
      } else {
        // Try to go to the searched username anyway
        router.push(`/${searchQuery.trim()}`)
      }
    }
  }

  const handleCreatorClick = (username) => {
    router.push(`/${username}`)
    setShowResults(false)
    setSearchQuery("")
  }

  return (
    <div className="bg-gray-950 text-white font-outfit">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-full mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            fuelmywork
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Support your favorite creators and fuel their passion
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-all duration-300 ${
                  isSearchFocused ? "scale-110 text-blue-400" : "scale-100"
                }`}
              />
              <Input
                placeholder="Search creator username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((creator) => (
                      <button
                        key={creator._id}
                        onClick={() => handleCreatorClick(creator.username)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          {creator.profileImage ? (
                            <img
                              src={creator.profileImage || "/placeholder.svg"}
                              alt={creator.name || creator.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{creator.name || creator.username}</div>
                          <div className="text-sm text-gray-400 truncate">@{creator.username}</div>
                          {creator.bio && <div className="text-xs text-gray-500 truncate mt-1">{creator.bio}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-4 text-center text-gray-400">No creators found for "{searchQuery}"</div>
                ) : null}
              </div>
            )}
          </div>

          <p className="text-gray-400 text-sm">Find and support creators by searching their username</p>
        </div>
      </div>

      {/* Rest of the homepage content remains the same */}
      {/* Stats Section */}
      <div className="py-16 px-6">
        <div className="max-w-full mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">10K+</div>
              <div className="text-gray-300">Active Creators</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">₹2M+</div>
              <div className="text-gray-300">Total Funded</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-400">50K+</div>
              <div className="text-gray-300">Supporters</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-full mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Find Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Search for your favorite creators by username and discover new talent
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Show Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Send financial support to help creators continue their amazing work
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Fuel Creativity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Help creators focus on what they do best while you enjoy their content
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Getting Started as Creator */}
      <div className="py-20 px-6">
        <div className="max-w-full mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Creating?</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of creators who are already earning from their passion. Set up your profile in minutes and
            start receiving support today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Build Your Community</h3>
                <p className="text-gray-400">
                  Connect with supporters who believe in your work and want to see you succeed.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center px-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-3">
                <Coffee className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Flexible Support</h3>
                <p className="text-gray-400">
                  Receive one-time tips or recurring support to fund your creative projects.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center px-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Reward Supporters</h3>
                <p className="text-gray-400">
                  Offer exclusive content and perks to show appreciation for your supporters.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center px-4">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mb-3">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Easy Setup</h3>
                <p className="text-gray-400">Get started in minutes with our simple creator onboarding process.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button
              onClick={() => router.push("/login")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push("/about")}
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-3 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-full mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Support the creators you love</h2>
          <p className="text-xl text-gray-300 mb-8">
            Every contribution helps fuel creativity and brings amazing content to life
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-3 bg-transparent"
            onClick={() => {
              // Focus on search bar
              const searchInput = document.querySelector('input[placeholder="Search creator username..."]')
              if (searchInput) {
                searchInput.focus()
                searchInput.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            Find Creators to Support
          </Button>
        </div>
      </div>
    </div>
  )
}
