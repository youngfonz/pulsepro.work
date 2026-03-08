'use client'

import { useState, useEffect } from 'react'
import { createBookmarkTask, getAllTags } from '@/actions/tasks'
import { Button } from '@/components/ui/Button'
import { TagInput } from '@/components/ui/TagInput'
import { Loader2, ExternalLink, Youtube, Twitter, Globe } from 'lucide-react'

interface BookmarkMetadata {
  title: string
  description?: string
  thumbnailUrl?: string
  type: 'youtube' | 'twitter' | 'website'
}

interface AddBookmarkFormProps {
  projectId: string
}

export function AddBookmarkForm({ projectId }: AddBookmarkFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [metadata, setMetadata] = useState<BookmarkMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getAllTags().then(setAllTags)
  }, [])

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      // Accept any http/https URL
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
          if (data.fallback) {
            setMetadata(data.fallback)
          }
        } else {
          setMetadata(data)
          setManualTitle(data.title)
        }
      } else {
        setError(data.error || 'Failed to fetch metadata')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUrlBlur = () => {
    if (url && !metadata) {
      fetchMetadata()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url || !metadata) {
      setError('Please enter a valid URL and wait for metadata to load')
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
        thumbnailUrl: metadata.thumbnailUrl,
        bookmarkType: metadata.type,
        tags,
        notes: notes || undefined,
      })

      // Reset form
      setUrl('')
      setMetadata(null)
      setManualTitle('')
      setTags([])
      setNotes('')
      setIsOpen(false)
    } catch (err) {
      setError('Failed to create bookmark. Please try again.')
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        + Add Bookmark
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-secondary/30">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
          URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
            }}
            onBlur={handleUrlBlur}
            onPaste={(e) => {
              setTimeout(fetchMetadata, 100)
            }}
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
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading
              </>
            ) : (
              'Fetch'
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>

      {metadata && (
        <>
          <div className="p-3 border border-border rounded-md bg-background">
            <div className="flex items-start gap-3">
              {metadata.thumbnailUrl && (
                <img
                  src={metadata.thumbnailUrl}
                  alt="Link preview"
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {metadata.type === 'youtube' ? (
                    <Youtube className="w-5 h-5 text-red-500" />
                  ) : metadata.type === 'twitter' ? (
                    <Twitter className="w-5 h-5 text-foreground" />
                  ) : (
                    <Globe className="w-5 h-5 text-blue-500" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {metadata.type}
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Edit title..."
                  className="w-full p-2 border border-input rounded text-sm font-medium mb-2 bg-background text-foreground placeholder:text-muted-foreground"
                  disabled={submitting}
                />
                {metadata.description && (
                  <p className="text-sm text-muted-foreground">{metadata.description}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1">
              Tags
            </label>
            <TagInput
              value={tags}
              onChange={setTags}
              suggestions={allTags}
              placeholder="Add tags..."
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full p-2 border border-input rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground"
              disabled={submitting}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !manualTitle.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Bookmark'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setUrl('')
                setMetadata(null)
                setManualTitle('')
                setError(null)
              }}
              disabled={submitting}
              className="px-4 py-2 border border-border rounded-md hover:bg-secondary text-foreground disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </form>
  )
}
