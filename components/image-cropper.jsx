"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Crop, RotateCw, ZoomIn } from "lucide-react"

export function ImageCropper({ open, onClose, imageSrc, onCropComplete, aspect = 1, circularCrop = false, title }) {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  })
  const [completedCrop, setCompletedCrop] = useState(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [imgRef, setImgRef] = useState(null)

  const onImageLoad = useCallback((e) => {
    setImgRef(e.currentTarget)
  }, [])

  const handleCropComplete = useCallback(() => {
    if (!completedCrop || !imgRef) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    const scaleX = imgRef.naturalWidth / imgRef.width
    const scaleY = imgRef.naturalHeight / imgRef.height

    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = "high"

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY

    const centerX = imgRef.naturalWidth / 2
    const centerY = imgRef.naturalHeight / 2

    ctx.save()

    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(imgRef, 0, 0)

    ctx.restore()

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob)
          onClose()
        }
      },
      "image/jpeg",
      0.9,
    )
  }, [completedCrop, imgRef, scale, rotate, onCropComplete, onClose])

  const handleClose = () => {
    setCrop({
      unit: "%",
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    })
    setCompletedCrop(null)
    setScale(1)
    setRotate(0)
    setImgRef(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Crop className="h-5 w-5 text-blue-400" />
            Crop {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {imageSrc && (
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop={circularCrop}
                className="max-w-full"
              >
                <img
                  ref={onImageLoad}
                  alt="Crop preview"
                  src={imageSrc || "/placeholder.svg"}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: "100%",
                    maxHeight: "400px",
                  }}
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-4 bg-gray-700/50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scale Control */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Zoom: {scale.toFixed(1)}x
                </Label>
                <Slider
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotate Control */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotate: {rotate}°
                </Label>
                <Slider
                  value={[rotate]}
                  onValueChange={(value) => setRotate(value[0])}
                  min={-180}
                  max={180}
                  step={15}
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setScale(1)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700"
              >
                Reset Zoom
              </Button>
              <Button
                onClick={() => setRotate(0)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700"
              >
                Reset Rotation
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button onClick={handleClose} variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleCropComplete} className="bg-blue-600 hover:bg-blue-700">
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
