'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  bucket: string
  folder?: string
  onUploadComplete: (url: string) => void
  onUploadError?: (error: string) => void
  maxSize?: number // in MB
  accept?: string
  multiple?: boolean
  label?: string
}

export default function ImageUpload({
  bucket,
  folder = '',
  onUploadComplete,
  onUploadError,
  maxSize = 10,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  multiple = false,
  label = 'Upload Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError?.(`File size exceeds ${maxSize}MB limit`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    await handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)

    try {
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

      onUploadComplete(data.url)
    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      
      {preview && (
        <div className="relative w-full h-48 mb-2">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Choose File'}
      </button>

      <p className="text-xs text-gray-500">
        Max size: {maxSize}MB. Accepted formats: JPEG, PNG, WebP
      </p>
    </div>
  )
}


