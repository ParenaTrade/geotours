'use client'

import { useState, useRef } from 'react'

interface MultiImageUploadProps {
  bucket: string
  folder?: string
  onUploadComplete: (urls: string[]) => void
  onUploadError?: (error: string) => void
  maxSize?: number
  maxFiles?: number
  label?: string
  existingImages?: string[]
}

export default function MultiImageUpload({
  bucket,
  folder = '',
  onUploadComplete,
  onUploadError,
  maxSize = 10,
  maxFiles = 10,
  label = 'Upload Images',
  existingImages = [],
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (uploadedImages.length + files.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`${file.name} exceeds ${maxSize}MB limit`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', bucket)
        if (folder) {
          formData.append('folder', folder)
        }

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        return data.url
      })

      const urls = await Promise.all(uploadPromises)
      const newImages = [...uploadedImages, ...urls]
      setUploadedImages(newImages)
      onUploadComplete(newImages)
    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async (index: number) => {
    const imageUrl = uploadedImages[index]
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    onUploadComplete(newImages)

    // Optionally delete from storage
    try {
      const urlParts = imageUrl.split('/')
      const path = urlParts.slice(-2).join('/')
      await fetch('/api/upload/image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, path }),
      })
    } catch (error) {
      console.error('Failed to delete image from storage:', error)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {uploadedImages.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              ×
            </button>
          </div>
        ))}

        {uploadedImages.length < maxFiles && (
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '+'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <p className="text-xs text-gray-500">
        {uploadedImages.length}/{maxFiles} images. Max size: {maxSize}MB each.
      </p>
    </div>
  )
}

