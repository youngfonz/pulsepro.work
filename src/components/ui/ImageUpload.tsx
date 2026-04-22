'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (path: string | null) => void
  type: 'clients' | 'projects' | 'tasks'
  className?: string
  label?: string
  aspect?: 'square' | 'wide'
}

export function ImageUpload({
  value,
  onChange,
  type,
  className,
  label,
  aspect = 'square',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
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
      onChange(data.path)
    } catch (err) {
      setError('Failed to upload image')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={cn(
          'relative overflow-hidden  border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400',
          aspect === 'square' ? 'aspect-square w-32' : 'aspect-video w-full max-w-xs',
          isUploading && 'opacity-50'
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-1 top-1  bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/80"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <label className="flex h-full cursor-pointer flex-col items-center justify-center text-gray-400 hover:text-gray-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-1 text-xs">
              {isUploading ? 'Uploading...' : 'Upload'}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
