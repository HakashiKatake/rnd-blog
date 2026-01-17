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
          <div className="mb-8">
            <h1 className="font-head text-4xl font-bold mb-2">
              Create Your <span className="text-primary">Research Post</span> ⚡
            </h1>
            <p className="text-muted-foreground">
              Share your engineering projects, research, and innovations with
              the community.
            </p>
          </div>

          {/* Form */}
          <PostForm userId={user._id} />
        </div>
      </main>
    </>
  )
}
