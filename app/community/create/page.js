"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CreatePostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated
  if (!session) {
    router.push("/login")
    return null
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target.result
      setImage(result)
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Please write something to share")
      return
    }

    if (content.trim().length > 2000) {
      toast.error("Post content must be less than 2000 characters")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          image: image,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Post created successfully!")
        router.push("/community")
      } else {
        toast.error(data.message || "Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = content.length
  const isOverLimit = characterCount > 2000

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
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Post</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Share something with the community</p>
            </div>
          </div>

          {/* Post Creation Form */}
          <Card className="bg-black border-gray-800">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center text-white">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mr-3 flex-shrink-0">
                  <AvatarImage
                    src={session?.user?.image || "/placeholder.svg?height=40&width=40"}
                    alt={session?.user?.name}
                  />
                  <AvatarFallback className="bg-gray-800 text-gray-300 text-xs sm:text-sm">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">{session?.user?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-400">Posting to Community</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Content Textarea */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="What's on your mind? Share your thoughts, updates, or behind-the-scenes moments..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`min-h-24 sm:min-h-32 resize-none bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                      isOverLimit ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm space-y-1 sm:space-y-0">
                    <span className="text-gray-400">Share your thoughts with the community</span>
                    <span className={`${isOverLimit ? "text-red-400" : "text-gray-400"}`}>{characterCount}/2000</span>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Post preview"
                        className="w-full max-h-64 sm:max-h-96 object-cover rounded-lg border border-gray-700"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 sm:p-8 text-center hover:border-gray-600 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        <span className="text-gray-400 text-sm sm:text-base">Click to add an image (optional)</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-800 space-y-3 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                    Your post will be visible to all community members
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/community")}
                      disabled={isSubmitting}
                      className="border-gray-700 text-white hover:bg-gray-900 hover:text-white w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !content.trim() || isOverLimit}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    >
                      {isSubmitting ? "Posting..." : "Share Post"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-4 sm:mt-6 bg-black border-gray-800">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <h3 className="font-semibold text-white mb-3 text-sm sm:text-base">Tips for great posts</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li>• Share behind-the-scenes moments from your creative process</li>
                <li>• Ask questions to engage with your community</li>
                <li>• Share updates about your projects and milestones</li>
                <li>• Be authentic and let your personality shine through</li>
                <li>• Use images to make your posts more engaging</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
