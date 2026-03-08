'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FileUpload } from '@/components/ui/FileUpload'
import { TagInput } from '@/components/ui/TagInput'
import { DatePicker } from '@/components/ui/DatePicker'
import {
  toggleTask,
  deleteTask,
  updateTask,
  addTaskImage,
  removeTaskImage,
  addTaskFile,
  removeTaskFile,
  addTaskComment,
  deleteTaskComment,
  getAllTags,
} from '@/actions/tasks'
import {
  priorityColors,
  priorityLabels,
  formatDate,
  isOverdue,
  formatFileSize,
  getFileIcon,
} from '@/lib/utils'

interface TaskImage {
  id: string
  path: string
  name: string
}

interface TaskFile {
  id: string
  path: string
  name: string
  type: string
  size: number
}

interface TaskComment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface Task {
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
  images: TaskImage[]
  files: TaskFile[]
  comments: TaskComment[]
  project: {
    id: string
    name: string
  } | null
}

interface Project {
  id: string
  name: string
  client: { name: string }
}

export function TaskDetail({ task, projects }: { task: Task; projects: Project[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const overdue = isOverdue(task.dueDate) && task.status !== 'done'

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTask(task.id)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    startTransition(async () => {
      await deleteTask(task.id)
      router.push('/tasks')
    })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </Link>

        <div className="mt-3 flex items-start gap-3">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`mt-1 h-6 w-6 flex-shrink-0 rounded border-2 transition-colors ${
              task.status === 'done'
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-border hover:border-primary'
            }`}
          >
            {task.status === 'done' && (
              <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h1
              className={`text-xl md:text-2xl font-bold ${
                task.status === 'done'
                  ? 'text-muted-foreground line-through'
                  : overdue
                  ? 'text-destructive'
                  : 'text-foreground'
              }`}
            >
              {task.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {task.project ? (
                <Link
                  href={`/projects/${task.project.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {task.project.name}
                </Link>
              ) : (
                <span>Quick task</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete task"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <TaskEditForm task={task} projects={projects} onClose={() => setIsEditing(false)} />
      ) : (
        <TaskReadView task={task} overdue={overdue} />
      )}
    </div>
  )
}

function TaskReadView({ task, overdue }: { task: Task; overdue: boolean }) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge className={priorityColors[task.priority]}>
          {priorityLabels[task.priority]}
        </Badge>
        {task.status === 'done' && (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Completed
          </Badge>
        )}
        {task.startDate && (
          <span className="text-sm text-muted-foreground">
            Start: {formatDate(task.startDate)}
          </span>
        )}
        {task.dueDate && (
          <span className={`text-sm ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            Due: {formatDate(task.dueDate)}
            {overdue && ' (Overdue)'}
          </span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {task.notes && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{task.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {task.images.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Images ({task.images.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {task.images.map((image) => (
                <a
                  key={image.id}
                  href={image.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-24 w-24 overflow-hidden rounded-lg border border-border hover:opacity-80 transition-opacity"
                >
                  <Image src={image.path} alt={image.name} fill className="object-cover" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files */}
      {task.files.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Files ({task.files.length})
            </p>
            <div className="space-y-1">
              {task.files.map((file) => (
                <a
                  key={file.id}
                  href={file.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <span className="flex-1 truncate text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardContent className="py-4">
          <TaskComments taskId={task.id} comments={task.comments} />
        </CardContent>
      </Card>
    </div>
  )
}

function TaskEditForm({ task, projects, onClose }: { task: Task; projects: Project[]; onClose: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [images, setImages] = useState<TaskImage[]>(task.images)
  const [files, setFiles] = useState<TaskFile[]>(task.files)

  const isBookmark = !!task.url && !!task.bookmarkType
  const [tags, setTags] = useState<string[]>(task.tags)
  const [allTags, setAllTags] = useState<string[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(task.thumbnailUrl)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isBookmark) {
      getAllTags().then(setAllTags)
    }
  }, [isBookmark])

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

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
      if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (isBookmark) {
      formData.append('tags', JSON.stringify(tags))
      formData.append('thumbnailUrl', thumbnailUrl ?? '')
    }
    startTransition(async () => {
      await updateTask(task.id, formData)
      onClose()
      router.refresh()
    })
  }

  const handleImageUploadComplete = async (file: { path: string; name: string; type: string; size: number }) => {
    await addTaskImage(task.id, file.path, file.name)
    setImages([...images, { id: Date.now().toString(), path: file.path, name: file.name }])
  }

  const handleFileUploadComplete = async (file: { path: string; name: string; type: string; size: number }) => {
    await addTaskFile(task.id, file.path, file.name, file.type, file.size)
    setFiles([...files, { id: Date.now().toString(), path: file.path, name: file.name, type: file.type, size: file.size }])
  }

  const handleRemoveImage = async (imageId: string) => {
    startTransition(async () => {
      await removeTaskImage(imageId)
      setImages(images.filter((img) => img.id !== imageId))
    })
  }

  const handleRemoveFile = async (fileId: string) => {
    startTransition(async () => {
      await removeTaskFile(fileId)
      setFiles(files.filter((f) => f.id !== fileId))
    })
  }

  return (
    <Card>
      <CardContent className="py-4">
        <form action={handleSubmit} className="space-y-4">
          <Input
            id="title"
            name="title"
            label="Title *"
            required
            defaultValue={task.title}
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            rows={3}
            defaultValue={task.description || ''}
          />
          <Textarea
            id="notes"
            name="notes"
            label="Notes"
            rows={4}
            defaultValue={task.notes || ''}
            placeholder="Add any additional notes..."
          />
          <Select
            id="projectId"
            name="projectId"
            label="Project"
            defaultValue={task.project?.id || 'none'}
            options={[
              { value: 'none', label: 'No Project (Quick Task)' },
              ...projects.map((p) => ({ value: p.id, label: `${p.name} (${p.client.name})` })),
            ]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              id="priority"
              name="priority"
              label="Priority"
              defaultValue={task.priority}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
            <DatePicker
              id="dueDate"
              name="dueDate"
              label="Due Date"
              defaultValue={formatDateForInput(task.dueDate)}
            />
          </div>

          {isBookmark && (
            <>
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
                      ref={thumbnailFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={thumbnailUploading}
                    />
                    <button
                      type="button"
                      onClick={() => thumbnailFileInputRef.current?.click()}
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
            </>
          )}

          {/* Task Images */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Images</label>
            <div className="flex flex-wrap gap-2">
              {images.map((image) => (
                <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                  <Image src={image.path} alt={image.name} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute right-1 top-1 rounded bg-destructive p-0.5 text-white hover:bg-destructive/80"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <FileUpload
              onUploadComplete={handleImageUploadComplete}
              accept="image/*"
              maxSize={10}
              label="Add image"
            />
          </div>

          {/* Task Files */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Files</label>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <span className="flex-1 truncate text-sm text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <FileUpload
              onUploadComplete={handleFileUploadComplete}
              accept="image/*,application/pdf,.md,text/markdown"
              maxSize={10}
              label="Add file (PDF, Image, or Markdown, up to 10MB)"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function TaskComments({ taskId, comments }: { taskId: string; comments: TaskComment[] }) {
  const [isPending, startTransition] = useTransition()
  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState(comments)

  const handleAddComment = () => {
    if (!newComment.trim()) return

    startTransition(async () => {
      await addTaskComment(taskId, newComment)
      setLocalComments([
        { id: Date.now().toString(), content: newComment, createdAt: new Date(), updatedAt: new Date() },
        ...localComments,
      ])
      setNewComment('')
    })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    startTransition(async () => {
      await deleteTaskComment(commentId)
      setLocalComments(localComments.filter((c) => c.id !== commentId))
    })
  }

  const formatCommentDate = (date: Date) => {
    const now = new Date()
    const commentDate = new Date(date)
    const diffMs = now.getTime() - commentDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(date)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        Comments ({localComments.length})
      </p>

      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="text-sm"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddComment}
          disabled={!newComment.trim() || isPending}
        >
          {isPending ? 'Adding...' : 'Add Comment'}
        </Button>
      </div>

      {localComments.length > 0 && (
        <div className="space-y-2">
          {localComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground whitespace-pre-wrap flex-1">
                  {comment.content}
                </p>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete comment"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCommentDate(comment.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
