'use client'

import { useState, useEffect, useRef } from 'react'
import { createBookmarkTask, getAllTags } from '@/actions/tasks'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { TagInput } from '@/components/ui/TagInput'
import { Loader2, ExternalLink, Youtube, Twitter, Globe, ImagePlus, X } from 'lucide-react'

interface Project {
  id: string
  name: string
  client: { name: string }
}

interface BookmarkMetadata {
  title: string
  description?: string
  thumbnailUrl?: string
  type: 'youtube' | 'twitter' | 'website'
}

export function AddBookmarkButton({ projects, defaultOpen = false }: { projects: Project[]; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Sync defaultOpen prop changes (e.g. navigating to /bookmarks?add=true from CommandBar)
  useEffect(() => {
    if (defaultOpen) setIsOpen(true)
  }, [defaultOpen])
  const [projectId, setProjectId] = useState('')
  const [url, setUrl] = useState('')
  const [metadata, setMetadata] = useState<BookmarkMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      getAllTags().then(setAllTags)
    }
  }, [isOpen])

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const fetchMetadata = async () => {
    if (!url.trim()) return
    if (!validateUrl(url)) {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    setError(null)
    setMetadata(null)

    try {
      const response = await fetch('/api/bookmark-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()

      if (response.ok) {
        if (data.error) {
          setError(data.error)
          if (data.fallback) setMetadata(data.fallback)
        } else {
          setMetadata(data)
          setManualTitle(data.title)
        }
      } else {
        setError(data.error || 'Failed to fetch metadata')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !metadata || !projectId) {
      setError('Please select a project and enter a valid URL')
      return
    }
    if (!manualTitle.trim()) {
      setError('Please provide a title for the bookmark')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createBookmarkTask(projectId, {
        url,
        title: manualTitle,
        description: metadata.description,
        thumbnailUrl: uploadedImageUrl || metadata.thumbnailUrl,
        bookmarkType: metadata.type,
        tags,
        notes: notes || undefined,
      })
      handleClose()
    } catch {
      setError('Failed to create bookmark. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, or WebP)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'tasks')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (response.ok) {
        setUploadedImageUrl(data.path)
      } else {
        setError(data.error || 'Failed to upload image')
      }
    } catch {
      setError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setProjectId('')
    setUrl('')
    setMetadata(null)
    setManualTitle('')
    setTags([])
    setNotes('')
    setError(null)
    setUploadedImageUrl(null)
    setUploading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Bookmark
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Add Bookmark" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="projectId"
            label="Project *"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: 'Select a project...' },
              ...projects.map((p) => ({ value: p.id, label: `${p.name} (${p.client.name})` })),
            ]}
          />

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
              URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null) }}
                onBlur={() => url && !metadata && fetchMetadata()}
                placeholder="Paste any URL..."
                className="flex-1 p-2 border border-input rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground"
                disabled={loading || submitting}
              />
              <button
                type="button"
                onClick={fetchMetadata}
                disabled={!url || loading || submitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
              </button>
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          {metadata && (
            <>
              <div className="p-3 border border-border rounded-md bg-secondary/30">
                <div className="flex items-start gap-3">
                  {(uploadedImageUrl || metadata.thumbnailUrl) ? (
                    <div className="relative flex-shrink-0">
                      <img src={uploadedImageUrl || metadata.thumbnailUrl!} alt="Bookmark thumbnail" className="w-20 h-20 object-cover rounded" />
                      {uploadedImageUrl && (
                        <button
                          type="button"
                          onClick={() => setUploadedImageUrl(null)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading || submitting}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || submitting}
                        className="w-20 h-20 rounded border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      >
                        {uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className="w-5 h-5" />
                            <span className="text-[10px]">Add image</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {metadata.type === 'youtube' ? (
                        <Youtube className="w-4 h-4 text-red-500" />
                      ) : metadata.type === 'twitter' ? (
                        <Twitter className="w-4 h-4 text-foreground" />
                      ) : (
                        <Globe className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground uppercase">{metadata.type}</span>
                    </div>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Edit title..."
                      className="w-full p-2 border border-input rounded text-sm font-medium bg-background text-foreground"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                <TagInput value={tags} onChange={setTags} suggestions={allTags} placeholder="Add tags..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={2}
                  className="w-full p-2 border border-input rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground"
                  disabled={submitting}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting || !manualTitle.trim() || !projectId}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : 'Add Bookmark'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 border border-border rounded-md hover:bg-secondary text-foreground disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
