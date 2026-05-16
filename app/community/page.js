"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MoreHorizontal, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CommunityPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  // Fetch posts
  const fetchPosts = async (pageNum = 1, append = false, sortOption = sortBy) => {
    try {
      console.log("[v0] Fetching posts from API...")
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10&sortBy=${sortOption}`)
      console.log("[v0] API response status:", response.status)
      const data = await response.json()
      console.log("[v0] API response data:", data)

      if (response.ok) {
        if (append) {
          setPosts((prev) => [...prev, ...data.posts])
        } else {
          setPosts(data.posts)
        }
        setHasMore(data.pagination.hasNextPage)
      } else {
        console.error("[v0] API error:", data.message)
        toast.error(data.message || "Failed to fetch posts")
      }
    } catch (error) {
      console.error("[v0] Error fetching posts:", error)
      toast.error("Failed to fetch posts")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more posts
  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    await fetchPosts(nextPage, true)
  }

  // Handle like/unlike
  const handleLike = async (postId) => {
    if (!session) {
      toast.error("Please sign in to like posts")
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        // Update the post in the local state
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likesCount: data.likesCount, isLiked: data.isLiked } : post,
          ),
        )
      } else {
        toast.error(data.message || "Failed to like post")
      }
    } catch (error) {
      console.error("Error liking post:", error)
      toast.error("Failed to like post")
    }
  }

  // Handle filter changes
  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setPage(1)
    setLoading(true)
    fetchPosts(1, false, newSort)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-4 px-4 sm:px-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="ml-3 min-w-0 flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-24 sm:w-32"></div>
                      <div className="h-3 bg-gray-700 rounded w-16 sm:w-24"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-32 bg-gray-700 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Community</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Discover what creators are sharing</p>
            </div>
            {session && (
              <Button
                onClick={() => router.push("/community/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            )}
          </div>

          {/* Filter buttons for sorting posts */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                variant={sortBy === "newest" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("newest")}
                className={`text-xs sm:text-sm ${
                  sortBy === "newest"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                }`}
              >
                Newest
              </Button>
              <Button
                variant={sortBy === "oldest" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("oldest")}
                className={`text-xs sm:text-sm ${
                  sortBy === "oldest"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                }`}
              >
                Oldest
              </Button>
              <Button
                variant={sortBy === "most-liked" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("most-liked")}
                className={`text-xs sm:text-sm ${
                  sortBy === "most-liked"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                }`}
              >
                Most Liked
              </Button>
              <Button
                variant={sortBy === "most-commented" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("most-commented")}
                className={`text-xs sm:text-sm ${
                  sortBy === "most-commented"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                }`}
              >
                Most Commented
              </Button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4 sm:space-y-6">
            {posts.length === 0 ? (
              <Card className="bg-black border-gray-800">
                <CardContent className="text-center py-8 sm:py-12 px-4">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No posts yet</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">
                    Be the first to share something with the community!
                  </p>
                  {session && (
                    <Button
                      onClick={() => router.push("/community/create")}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    >
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post._id} className="bg-black border-gray-800 hover:border-gray-700 transition-colors">
                  <CardHeader className="flex flex-row items-start sm:items-center space-y-0 pb-4 px-4 sm:px-6">
                    <Link href={`/${post.creator.username}`} className="flex items-start sm:items-center flex-1">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <AvatarImage
                          src={post.creator.profileImage || "/placeholder.svg?height=40&width=40"}
                          alt={post.creator.name}
                        />
                        <AvatarFallback className="bg-gray-700 text-gray-300 text-xs sm:text-sm">
                          {post.creator.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="font-semibold text-white hover:text-blue-400 transition-colors text-sm sm:text-base truncate">
                          {post.creator.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          <span className="hidden sm:inline">@{post.creator.username} • </span>
                          {formatDistanceToNow(new Date(post.createdAt))} ago
                        </p>
                      </div>
                    </Link>
                    <div className="ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 sm:p-2"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-white whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                        {post.content}
                      </p>

                      {post.image && (
                        <div className="rounded-lg overflow-hidden border border-gray-700">
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt="Post image"
                            className="w-full h-auto max-h-64 sm:max-h-96 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-4 sm:space-x-6 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post._id)}
                          className={`text-gray-400 hover:text-blue-400 transition-colors p-1 sm:p-2 ${
                            post.isLiked ? "text-blue-400" : ""
                          }`}
                        >
                          <Heart className={`w-4 h-4 mr-1 sm:mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                          <span className="text-xs sm:text-sm">{post.likesCount || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/community/post/${post._id}`)}
                          className="text-gray-400 hover:text-blue-400 transition-colors p-1 sm:p-2"
                        >
                          <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">{post.commentsCount || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-blue-400 transition-colors p-1 sm:p-2"
                        >
                          <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {hasMore && posts.length > 0 && (
              <div className="text-center py-4 sm:py-6">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-900 hover:text-white bg-transparent w-full sm:w-auto"
                >
                  {loadingMore ? "Loading..." : "Load More Posts"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
