'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { addProjectImage, removeProjectImage } from '@/actions/projects'

interface ProjectImage {
  id: string
  path: string
  name: string
}

export function ProjectImages({
  projectId,
  images: initialImages,
  canEdit = true,
}: {
  projectId: string
  images: ProjectImage[]
  canEdit?: boolean
}) {
  const [images, setImages] = useState<ProjectImage[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'projects')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      await addProjectImage(projectId, data.path, data.name)
      setImages([...images, { id: Date.now().toString(), path: data.path, name: data.name }])
    } catch (err) {
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!confirm('Remove this image?')) return
    startTransition(async () => {
      await removeProjectImage(imageId)
      setImages(images.filter((img) => img.id !== imageId))
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative h-32 w-32 overflow-hidden  border border-gray-200 ${isPending ? 'opacity-50' : ''}`}
          >
            <Image src={image.path} alt={image.name} fill className="object-cover" />
            {canEdit && (
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute right-1 top-1  bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/80"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {canEdit && (
          <label
            className={`flex h-32 w-32 cursor-pointer flex-col items-center justify-center  border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-1 text-xs">{isUploading ? 'Uploading...' : 'Add Image'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {images.length === 0 && (
        <p className="text-sm text-gray-500">No images yet. Upload images related to this project.</p>
      )}
    </div>
  )
}
