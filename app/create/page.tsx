import { getOrCreateUser } from '@/lib/auth/user'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { PostForm } from '@/components/create/CreatePostForm'

export default async function CreatePage() {
  const user = await getOrCreateUser()

  if (!user) {
    redirect('/sign-in')
  }



  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full border-2 border-brutal bg-card px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] shadow-brutal-sm">
              Community publishing
            </div>
            <h1 className="font-head text-4xl font-bold mb-3">
              Create Your <span className="text-primary">Blog Post</span> ⚡
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Share your ideas, builds, experiments, and engineering stories
              with the community. Club moderators review and approve posts
              before they go live on SPARK.
            </p>
          </div>

          {/* Form */}
          <PostForm userId={user._id} />
        </div>
      </main>
    </>
  )
}
