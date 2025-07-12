"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CropIcon, RotateCcw } from "lucide-react"
import "react-image-crop/dist/ReactCrop.css"

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropper({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = null, // null for free crop, 1 for square, 16/9 for banner, etc.
  title = "Crop Image",
}) {
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  const onImageLoad = useCallback(
    (e) => {
      if (aspectRatio) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, aspectRatio))
      }
    },
    [aspectRatio],
  )

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext("2d")
    const pixelRatio = window.devicePixelRatio

    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty")
            return
          }
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        },
        "image/jpeg",
        0.9,
      )
    })
  }, [completedCrop])

  const handleCropComplete = async () => {
    const croppedImage = await getCroppedImg()
    if (croppedImage) {
      onCropComplete(croppedImage)
      onClose()
    }
  }

  const resetCrop = () => {
    if (imgRef.current && aspectRatio) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, aspectRatio))
    } else {
      setCrop(undefined)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-800 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {imageSrc && (
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-h-96"
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageSrc || "/placeholder.svg"}
                  onLoad={onImageLoad}
                  className="max-h-96 max-w-full"
                />
              </ReactCrop>
            </div>
          )}

          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={resetCrop}
            variant="outline"
            className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button onClick={handleCropComplete} className="bg-blue-600 hover:bg-blue-700" disabled={!completedCrop}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
