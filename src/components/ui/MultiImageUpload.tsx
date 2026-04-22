'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface UploadedImage {
  id?: string
  path: string
  name: string
}

interface MultiImageUploadProps {
  images: UploadedImage[]
  onAdd: (image: { path: string; name: string }) => void
  onRemove: (index: number, id?: string) => void
  type: 'projects' | 'tasks'
  className?: string
  label?: string
}

export function MultiImageUpload({
  images,
  onAdd,
  onRemove,
  type,
  className,
  label,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onAdd({ path: data.path, name: data.name })

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (err) {
      setError('Failed to upload image')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className="relative h-24 w-24 overflow-hidden  border border-gray-200"
          >
            <Image
              src={image.path}
              alt={image.name}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index, image.id)}
              className="absolute right-1 top-1  bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/80"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <label
          className={cn(
            'flex h-24 w-24 cursor-pointer flex-col items-center justify-center  border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500',
            isUploading && 'cursor-not-allowed opacity-50'
          )}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="mt-1 text-xs">{isUploading ? 'Uploading...' : 'Add'}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
