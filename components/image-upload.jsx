"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/image-cropper"
import { toast } from "sonner"
import { Upload, Crop, User, ImageIcon, Camera, X } from "lucide-react"

export function ImageUpload({
  currentImage,
  onImageUpdate,
  aspect = 1,
  circularCrop = false,
  title = "Upload Image",
  description = "Click to upload and crop image",
  className = "",
  size = "medium", // "small", "medium", "large", "banner"
}) {
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropperImage, setCropperImage] = useState("")
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setCropperImage(e.target.result)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImageBlob) => {
    // Convert blob to base64
    const reader = new FileReader()
    reader.onload = () => {
      onImageUpdate(reader.result)
      toast.success("Image updated successfully")
    }
    reader.readAsDataURL(croppedImageBlob)
  }

  const handleRemoveImage = () => {
    onImageUpdate("")
    toast.success("Image removed")
  }

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-16 h-16"
      case "medium":
        return "w-24 h-24"
      case "large":
        return "w-32 h-32"
      case "banner":
        return "w-full h-40"
      default:
        return "w-24 h-24"
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "small":
        return "h-4 w-4"
      case "medium":
        return "h-6 w-6"
      case "large":
        return "h-8 w-8"
      case "banner":
        return "h-12 w-12"
      default:
        return "h-6 w-6"
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-gray-300 font-medium">{title}</Label>
        {currentImage && (
          <Button
            type="button"
            onClick={handleRemoveImage}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="relative">
        <div
          className={`${getSizeClasses()} ${
            circularCrop ? "rounded-full" : "rounded-lg"
          } bg-gray-700/50 overflow-hidden border-2 border-dashed border-gray-600 hover:border-gray-500 transition-all duration-200 cursor-pointer group relative`}
          onClick={triggerFileInput}
        >
          {currentImage ? (
            <img src={currentImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-300 transition-colors">
              {circularCrop ? <User className={getIconSize()} /> : <ImageIcon className={getIconSize()} />}
              {size !== "small" && (
                <span className="text-xs mt-2 text-center px-2 font-medium">
                  {size === "banner" ? "Click to upload banner" : "Click to upload"}
                </span>
              )}
            </div>
          )}

          {/* Overlay on hover - positioned absolutely within the image container */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs font-medium">{currentImage ? "Change" : "Upload"}</span>
            </div>
          </div>
        </div>

        {/* File input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        {/* Crop icon indicator */}
        {currentImage && (
          <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1.5 shadow-lg">
            <Crop className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">{description}</p>

      {/* Image Cropper Modal */}
      <ImageCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={cropperImage}
        onCropComplete={handleCropComplete}
        aspect={aspect}
        circularCrop={circularCrop}
        title={title}
      />
    </div>
  )
}
