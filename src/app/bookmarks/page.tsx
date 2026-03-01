import Link from 'next/link'
import { getAllBookmarks, getProjectsForTaskFilter } from '@/actions/tasks'
import { Card, CardContent } from '@/components/ui/Card'
import { BookmarksFilter } from './BookmarksFilter'
import { BookmarksList } from './BookmarksList'
import { AddBookmarkButton } from './AddBookmarkButton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ search?: string; projectId?: string; type?: string; sort?: string; add?: string }>
}

export default async function BookmarksPage({ searchParams }: Props) {
  const params = await searchParams
  const [bookmarks, projects] = await Promise.all([
    getAllBookmarks({
      search: params.search,
      projectId: params.projectId,
      bookmarkType: params.type,
      sort: params.sort,
    }),
    getProjectsForTaskFilter(),
  ])

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">Bookmarks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your saved YouTube videos and X posts across projects
          </p>
        </div>
        <AddBookmarkButton projects={projects} defaultOpen={params.add === 'true'} />
      </div>

      <BookmarksFilter projects={projects} />

      <Card>
        <CardContent className="p-6">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p>No bookmarks yet.</p>
              <p className="text-sm mt-1">Add bookmarks from project pages to see them here.</p>
            </div>
          ) : (
            <BookmarksList bookmarks={bookmarks} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
