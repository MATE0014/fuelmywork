"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, ArrowLeft, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"

export default function PostDetailPage({ params }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { postId } = params
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)

  // Fetch post details
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      const data = await response.json()

      if (response.ok) {
        setPost(data.post)
      } else {
        toast.error(data.message || "Failed to fetch post")
        router.push("/community")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      toast.error("Failed to fetch post")
      router.push("/community")
    } finally {
      setLoading(false)
    }
  }

  // Fetch comments
  const fetchComments = async () => {
    try {
      setCommentsLoading(true)
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()

      if (response.ok) {
        setComments(data.comments)
      } else {
        toast.error(data.message || "Failed to fetch comments")
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast.error("Failed to fetch comments")
    } finally {
      setCommentsLoading(false)
    }
  }

  // Handle like/unlike
  const handleLike = async () => {
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
        setPost((prev) => ({
          ...prev,
          likesCount: data.likesCount,
          isLiked: data.isLiked,
        }))
      } else {
        toast.error(data.message || "Failed to like post")
      }
    } catch (error) {
      console.error("Error liking post:", error)
      toast.error("Failed to like post")
    }
  }

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!session) {
      toast.error("Please sign in to comment")
      return
    }

    if (!commentContent.trim()) {
      toast.error("Please write a comment")
      return
    }

    if (commentContent.trim().length > 500) {
      toast.error("Comment must be less than 500 characters")
      return
    }

    setIsSubmittingComment(true)

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentContent.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setComments((prev) => [...prev, data.comment])
        setPost((prev) => ({
          ...prev,
          commentsCount: data.commentsCount,
        }))
        setCommentContent("")
        toast.success("Comment added successfully!")
      } else {
        toast.error(data.message || "Failed to add comment")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchComments()
    }
  }, [postId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <Card className="bg-black border-gray-800">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
                  <div className="ml-3 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-24"></div>
                    <div className="h-3 bg-gray-800 rounded w-16"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-800 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Post not found</h1>
            <Link href="/community">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Community</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const characterCount = commentContent.length
  const isOverLimit = characterCount > 500

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <Link href="/community" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                className="mr-0 sm:mr-4 text-gray-400 hover:text-white hover:bg-gray-900 w-full sm:w-auto justify-start"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Community
              </Button>
            </Link>
            <div className="sm:ml-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Post Details</h1>
            </div>
          </div>

          {/* Post */}
          <Card className="bg-black border-gray-800 mb-4 sm:mb-6">
            {/* Post Header */}
            <CardHeader className="flex flex-row items-start sm:items-center space-y-0 pb-4 px-4 sm:px-6">
              <Link href={`/${post.creator.username}`} className="flex items-start sm:items-center flex-1">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <AvatarImage
                    src={post.creator.profileImage || "/placeholder.svg?height=40&width=40"}
                    alt={post.creator.name}
                  />
                  <AvatarFallback className="bg-gray-800 text-gray-300 text-xs sm:text-sm">
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
            </CardHeader>
            {/* Post Content */}
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Post Content */}
                <p className="text-white whitespace-pre-wrap leading-relaxed text-base sm:text-lg">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <div className="rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post image"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center space-x-4 sm:space-x-6 pt-4 border-t border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`text-gray-400 hover:text-blue-400 transition-colors p-1 sm:p-2 ${
                      post.isLiked ? "text-blue-400" : ""
                    }`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                    <span className="text-xs sm:text-sm">{post.likesCount || 0}</span>
                  </Button>
                  <div className="flex items-center text-gray-400">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">{post.commentsCount || 0}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-blue-400 transition-colors p-1 sm:p-2"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comment Form */}
          {session && (
            <Card className="bg-black border-gray-800 mb-4 sm:mb-6">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <form onSubmit={handleCommentSubmit} className="space-y-3 sm:space-y-4">
                  {/* Comment Form */}
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <AvatarImage
                        src={session?.user?.image || "/placeholder.svg?height=32&width=32"}
                        alt={session?.user?.name}
                      />
                      <AvatarFallback className="bg-gray-800 text-gray-300 text-xs">
                        {session?.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className={`min-h-16 sm:min-h-20 resize-none bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          isOverLimit ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                        disabled={isSubmittingComment}
                      />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <span className={`text-xs ${isOverLimit ? "text-red-400" : "text-gray-400"}`}>
                          {characterCount}/500
                        </span>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingComment || !commentContent.trim() || isOverLimit}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        >
                          {isSubmittingComment ? (
                            "Posting..."
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card className="bg-black border-gray-800">
            <CardHeader className="px-4 sm:px-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">Comments ({comments.length})</h3>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {commentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 sm:h-4 bg-gray-800 rounded w-20 sm:w-24"></div>
                        <div className="h-2 sm:h-3 bg-gray-800 rounded w-full"></div>
                        <div className="h-2 sm:h-3 bg-gray-800 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">No comments yet</p>
                  {!session && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      <Link href="/login" className="text-blue-400 hover:underline">
                        Sign in
                      </Link>{" "}
                      to be the first to comment
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-2 sm:space-x-3">
                      <Link href={`/${comment.user.username}`}>
                        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                          <AvatarImage
                            src={comment.user.profileImage || "/placeholder.svg?height=32&width=32"}
                            alt={comment.user.name}
                          />
                          <AvatarFallback className="bg-gray-800 text-gray-300 text-xs">
                            {comment.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-900 rounded-lg px-2 sm:px-3 py-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                            <Link href={`/${comment.user.username}`}>
                              <span className="font-semibold text-white hover:text-blue-400 transition-colors text-xs sm:text-sm truncate">
                                {comment.user.name}
                              </span>
                            </Link>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-white text-xs sm:text-sm whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
