'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { deleteTask, toggleTask, updateTask, getAllTags } from '@/actions/tasks'
import { Modal } from '@/components/ui/Modal'
import { TagInput } from '@/components/ui/TagInput'

interface Bookmark {
  id: string
  title: string
  description: string | null
  notes: string | null
  status: string
  priority: string
  startDate: Date | null
  dueDate: Date | null
  url: string | null
  bookmarkType: string | null
  thumbnailUrl: string | null
  tags: string[]
  createdAt: Date
  project: {
    id: string
    name: string
  } | null
}

function TypeIcon({ type, size = 'sm' }: { type: string | null; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-12 h-12' : 'w-5 h-5'

  if (type === 'youtube') {
    return (
      <svg className={`${cls} text-red-500`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
  if (type === 'twitter') {
    return (
      <svg className={`${cls} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  }
  return (
    <svg className={`${cls} text-muted-foreground`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

function TypeBadge({ type }: { type: string | null }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
      type === 'youtube'
        ? 'bg-red-500 text-white'
        : type === 'twitter'
        ? 'bg-foreground text-background'
        : 'bg-primary text-primary-foreground'
    }`}>
      {type === 'youtube' ? 'YouTube' : type === 'twitter' ? 'X' : 'Website'}
    </span>
  )
}

function doneLabel(type: string | null): { done: string; undone: string; progress: string } {
  if (type === 'youtube') return { done: 'Watched', undone: 'Mark as watched', progress: 'watched' }
  if (type === 'twitter') return { done: 'Read', undone: 'Mark as read', progress: 'read' }
  return { done: 'Read', undone: 'Mark as read', progress: 'read' }
}

function EditButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Edit bookmark"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
  )
}

function DeleteButton({ bookmarkId }: { bookmarkId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this bookmark?')) return
    startTransition(async () => {
      await deleteTask(bookmarkId)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      title="Delete bookmark"
    >
      {isPending ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  )
}

function DoneButton({ bookmarkId, done, type }: { bookmarkId: string; done: boolean; type: string | null }) {
  const [isPending, startTransition] = useTransition()
  const labels = doneLabel(type)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await toggleTask(bookmarkId)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-md transition-colors ${
        done
          ? 'text-success hover:text-success/80 hover:bg-success/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
      title={done ? `Undo ${labels.done.toLowerCase()}` : labels.undone}
    >
      {done ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0 0 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0a11.954 11.954 0 0 0-7.834 2.916" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </button>
  )
}

function BookmarkEditModal({
  bookmark,
  isOpen,
  onClose,
}: {
  bookmark: Bookmark
  isOpen: boolean
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(bookmark.title)
  const [tags, setTags] = useState<string[]>(bookmark.tags)
  const [allTags, setAllTags] = useState<string[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(bookmark.thumbnailUrl)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(bookmark.title)
      setTags(bookmark.tags)
      setThumbnailUrl(bookmark.thumbnailUrl)
      getAllTags().then(setAllTags)
    }
  }, [isOpen, bookmark.title, bookmark.tags, bookmark.thumbnailUrl])

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return

    setThumbnailUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'tasks')
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()
      if (response.ok) setThumbnailUrl(data.path)
    } finally {
      setThumbnailUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', bookmark.description ?? '')
    formData.append('notes', bookmark.notes ?? '')
    formData.append('priority', bookmark.priority)
    if (bookmark.startDate) {
      formData.append('startDate', formatDateForInput(bookmark.startDate))
    }
    if (bookmark.dueDate) {
      formData.append('dueDate', formatDateForInput(bookmark.dueDate))
    }
    formData.append('tags', JSON.stringify(tags))
    formData.append('thumbnailUrl', thumbnailUrl ?? '')

    startTransition(async () => {
      await updateTask(bookmark.id, formData)
      onClose()
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Bookmark" className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border border-input rounded-md text-sm bg-background text-foreground"
          />
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Thumbnail</label>
          {thumbnailUrl ? (
            <div className="relative inline-block">
              <img src={thumbnailUrl} alt="Bookmark thumbnail" className="w-32 h-20 object-cover rounded border border-border" />
              <button
                type="button"
                onClick={() => setThumbnailUrl(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                disabled={thumbnailUploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={thumbnailUploading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                {thumbnailUploading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {thumbnailUploading ? 'Uploading...' : 'Upload thumbnail'}
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Tags</label>
          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={allTags}
            placeholder="Add tags..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-secondary text-foreground text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

function BookmarkMeta({ bookmark }: { bookmark: Bookmark }) {
  return (
    <>
      <div className="flex items-center justify-between">
        {bookmark.project ? (
          <Link
            href={`/projects/${bookmark.project.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {bookmark.project.name}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Quick task</span>
        )}
        <span className="text-xs text-muted-foreground">
          {new Date(bookmark.createdAt).toLocaleDateString()}
        </span>
      </div>
      {bookmark.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {bookmark.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded"
            >
              {tag}
            </span>
          ))}
          {bookmark.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{bookmark.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </>
  )
}

function ImageCard({ bookmark }: { bookmark: Bookmark }) {
  const isDone = bookmark.status === 'done'
  const labels = doneLabel(bookmark.bookmarkType)
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  return (
    <>
      <div className={`group border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all ${isDone ? 'opacity-50' : ''}`}>
        <a
          href={bookmark.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="aspect-video bg-muted relative overflow-hidden">
            <img
              src={bookmark.thumbnailUrl!}
              alt="Bookmark thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2">
              <TypeBadge type={bookmark.bookmarkType} />
            </div>
            {isDone && (
              <div className="absolute top-2 right-2 bg-success text-success-foreground text-xs px-2 py-0.5 rounded font-medium">
                {labels.done}
              </div>
            )}
          </div>
        </a>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <a
              href={bookmark.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0"
            >
              <h3 className={`font-medium text-sm line-clamp-2 transition-colors ${isDone ? 'line-through text-muted-foreground' : 'group-hover:text-primary'}`}>
                {bookmark.title}
              </h3>
            </a>
            <div className="flex items-center">
              <EditButton onClick={handleEdit} />
              <DoneButton bookmarkId={bookmark.id} done={isDone} type={bookmark.bookmarkType} />
              <DeleteButton bookmarkId={bookmark.id} />
            </div>
          </div>
          <div className="mt-2">
            <BookmarkMeta bookmark={bookmark} />
          </div>
        </div>
      </div>
      <BookmarkEditModal
        bookmark={bookmark}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </>
  )
}

function CompactCard({ bookmark }: { bookmark: Bookmark }) {
  const isDone = bookmark.status === 'done'
  const displayUrl = bookmark.url
    ? bookmark.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    : ''
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  return (
    <>
      <div className={`group flex items-start gap-3 border border-border rounded-lg p-3 hover:border-primary/50 hover:shadow-md transition-all ${isDone ? 'opacity-50' : ''}`}>
        <a
          href={bookmark.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center"
        >
          <TypeIcon type={bookmark.bookmarkType} size="sm" />
        </a>
        <a
          href={bookmark.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0"
        >
          <div className="flex items-start gap-2">
            <h3 className={`font-medium text-sm line-clamp-2 transition-colors flex-1 ${isDone ? 'line-through text-muted-foreground' : 'group-hover:text-primary'}`}>
              {bookmark.title}
            </h3>
            <TypeBadge type={bookmark.bookmarkType} />
          </div>
          {displayUrl && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{displayUrl}</p>
          )}
          <div className="mt-1.5">
            <BookmarkMeta bookmark={bookmark} />
          </div>
        </a>
        <div className="flex flex-col items-center">
          <EditButton onClick={handleEdit} />
          <DoneButton bookmarkId={bookmark.id} done={isDone} type={bookmark.bookmarkType} />
          <DeleteButton bookmarkId={bookmark.id} />
        </div>
      </div>
      <BookmarkEditModal
        bookmark={bookmark}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </>
  )
}

export function BookmarksList({ bookmarks }: { bookmarks: Bookmark[] }) {
  const doneCount = bookmarks.filter((b) => b.status === 'done').length
  const totalCount = bookmarks.length

  // Sort: incomplete first, done last
  const sorted = [...bookmarks].sort((a, b) => {
    const aDone = a.status === 'done'
    const bDone = b.status === 'done'
    if (aDone === bDone) return 0
    return aDone ? 1 : -1
  })

  const withImages = sorted.filter((b) => b.thumbnailUrl)
  const withoutImages = sorted.filter((b) => !b.thumbnailUrl)

  return (
    <div className="space-y-6">
      {doneCount > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }}
              />
            </div>
            <span>{doneCount}/{totalCount} done</span>
          </div>
        </div>
      )}
      {withImages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withImages.map((bookmark) => (
            <ImageCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
      {withoutImages.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {withoutImages.map((bookmark) => (
            <CompactCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
    </div>
  )
}
