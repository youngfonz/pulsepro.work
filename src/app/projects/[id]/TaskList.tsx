'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { FileUpload } from '@/components/ui/FileUpload'
import { TagInput } from '@/components/ui/TagInput'
import { DatePicker } from '@/components/ui/DatePicker'
import { toggleTask, deleteTask, updateTask, addTaskImage, removeTaskImage, addTaskFile, removeTaskFile, addTaskComment, deleteTaskComment, getTaskComments, getAllTags } from '@/actions/tasks'
import { priorityColors, priorityLabels, formatDate, isOverdue, formatFileSize, getFileIcon } from '@/lib/utils'

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
  _count: { comments: number }
}

export function TaskList({ tasks, canEdit = true }: { tasks: Task[]; canEdit?: boolean }) {
  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No tasks yet. Add your first task above.
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} canEdit={canEdit} />
      ))}
    </div>
  )
}

function TaskItem({ task, canEdit = true }: { task: Task; canEdit?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const overdue = isOverdue(task.dueDate) && task.status !== 'done'

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTask(task.id)
    })
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    startTransition(async () => {
      await deleteTask(task.id)
    })
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  const isBookmark = !!task.url && !!task.bookmarkType

  return (
    <>
      <div className={`py-3 ${isPending ? 'opacity-50' : ''}`}>
        <div className="flex items-start gap-3">
          {isBookmark && task.thumbnailUrl && (
            <button
              onClick={() => window.open(task.url!, '_blank')}
              className="flex-shrink-0 w-16 h-16 overflow-hidden rounded border border-border hover:opacity-80 transition-opacity cursor-pointer"
              title="Open bookmark"
            >
              <img
                src={task.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          )}
          {canEdit ? (
            <button
              onClick={handleToggle}
              className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 transition-colors ${
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
          ) : (
            <div className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 ${
              task.status === 'done'
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-border'
            }`}>
              {task.status === 'done' && (
                <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`font-medium text-left ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'} hover:text-link`}
              >
                {task.title}
              </button>
              {isBookmark && (
                <a
                  href={task.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-link"
                  title="Open bookmark"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {isBookmark && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  task.bookmarkType === 'youtube'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                    : task.bookmarkType === 'twitter'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>
                  {task.bookmarkType === 'youtube' ? 'YouTube' : task.bookmarkType === 'twitter' ? 'X' : 'Link'}
                </span>
              )}
              <Badge className={`${priorityColors[task.priority]} text-xs`}>
                {priorityLabels[task.priority]}
              </Badge>
              {task.tags.length > 0 && task.tags.map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded">
                  {tag}
                </span>
              ))}
              {task.images.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {task.images.length} image{task.images.length > 1 ? 's' : ''}
                </span>
              )}
              {task.files.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {task.files.length} file{task.files.length > 1 ? 's' : ''}
                </span>
              )}
              {task._count.comments > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {task._count.comments}
                </span>
              )}
            </div>
            {task.dueDate && (
              <p className={`text-xs sm:text-sm ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                {task.startDate && `${formatDate(task.startDate)} - `}Due: {formatDate(task.dueDate)}
                {overdue && ' (Overdue)'}
              </p>
            )}
          </div>
          {canEdit && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-link transition-colors"
                title="Edit task"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete task"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Expanded view with description, notes, images, and files */}
        {isExpanded && (
          <div className="mt-3 ml-8 space-y-3">
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            {task.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50  p-2">{task.notes}</p>
              </div>
            )}
            {task.images.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Images</p>
                <div className="flex flex-wrap gap-2">
                  {task.images.map((image) => (
                    <div key={image.id} className="relative h-20 w-20 overflow-hidden  border border-border">
                      <Image src={image.path} alt={image.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {task.files.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Files</p>
                <div className="space-y-1">
                  {task.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2  border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      <span className="flex-1 truncate text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            <TaskComments taskId={task.id} canEdit={canEdit} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={isBookmark ? 'Edit Bookmark' : 'Edit Task'}
        className="max-w-lg"
      >
        <TaskEditForm
          task={task}
          onClose={() => setIsEditing(false)}
        />
      </Modal>
    </>
  )
}

function TaskEditForm({ task, onClose }: { task: Task; onClose: () => void }) {
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
                <img src={thumbnailUrl} alt="" className="w-32 h-20 object-cover rounded border border-border" />
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
            <div key={image.id} className="relative h-20 w-20 overflow-hidden  border border-border">
              <Image src={image.path} alt={image.name} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute right-1 top-1  bg-destructive p-0.5 text-white hover:bg-destructive/80"
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
            <div key={file.id} className="flex items-center gap-2  border border-border bg-muted/50 px-3 py-2">
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
  )
}

function TaskComments({ taskId, canEdit = true }: { taskId: string; canEdit?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState<TaskComment[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getTaskComments(taskId).then(comments => {
      if (!cancelled) {
        setLocalComments(comments)
        setLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [taskId])

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

  if (!loaded) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Comments</p>
        <p className="text-xs text-muted-foreground">Loading comments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        Comments ({localComments.length})
      </p>

      {/* Add comment form */}
      {canEdit && (
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
      )}

      {/* Comments list */}
      {localComments.length > 0 && (
        <div className="space-y-2">
          {localComments.map((comment) => (
            <div
              key={comment.id}
              className="border border-border bg-muted/30 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground whitespace-pre-wrap flex-1">
                  {comment.content}
                </p>
                {canEdit && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete comment"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
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
