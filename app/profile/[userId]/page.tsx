import { client, urlFor, getImageUrl } from '@/lib/sanity/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { currentUser } from '@clerk/nextjs/server'
import { Navigation } from '@/components/layout/Navigation'
import { PostCard } from '@/components/explore/PostCard'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'
import ProfileDownloadButton from '@/components/profile/ProfileDownloadButton'

import { auth } from '@clerk/nextjs/server'

import { getOrCreateUser } from '@/lib/auth/user'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const { userId: loggedInClerkId } = await auth()

  console.log(`[Profile Debug] Params ID: ${userId}, LoggedInID: ${loggedInClerkId}`)

  // If viewing own profile by Clerk ID, ensure Sanity user exists
  if (loggedInClerkId && loggedInClerkId === userId) {
    await getOrCreateUser()
  }



  const user = await client.fetch(
    `*[_type == "user" && (_id == $userId || clerkId == $userId)][0] {
      _id,
      name,
      email,
      avatar,
      bio,
      about,
      education,
      university,
      location,
      tier,
      points,
      sparksReceived,
      postsPublished,
      collaborationsCount,
      badges,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      clerkId
    }`,
    { userId }
  )

  if (!user) {
    notFound()
  }

  // Get user's posts
  const posts = await client.fetch(
    `*[_type == "post" && author._ref == $userId && status == "approved"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      thumbnail,
      coverImageUrl,
      tags,
      sparkCount,
      viewCount,
      publishedAt,
      "author": author->{name, avatar, tier}
    }`,
    { userId: user._id }
  )

  // Robust check: Matches URL param OR matches the stored clerkId in the fetched user doc
  const isOwnProfile = loggedInClerkId && (loggedInClerkId === userId || loggedInClerkId === user.clerkId)

  const tierNames = ['', 'Spark Initiate', 'Idea Igniter', 'Forge Master', 'RnD Fellow']
  const tierEmojis = ['', '⚡', '🔥', '⚙️', '🏆']

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Profile Header */}
          <div className="border-brutal p-8 bg-card mb-8">
            <div className="flex flex-col md:flex-row gap-6 relative items-start">



              {/* Avatar */}
              {user.avatar && (
                <Image
                  src={
                    typeof user.avatar === 'string'
                      ? user.avatar
                      : getImageUrl(user.avatar) || ''
                  }
                  alt={user.name}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-black object-cover"
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="font-head text-3xl font-bold mb-2">
                      {user.name}
                    </h1>
                    <Badge className="bg-secondary text-secondary-foreground text-lg">
                      Tier {user.tier}: {tierNames[user.tier]} {tierEmojis[user.tier]}
                    </Badge>
                  </div>
                </div>

                {/* Edit Button & Download (Top Right) */}
                <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                  <ProfileDownloadButton user={user} posts={posts} />

                  {isOwnProfile && (
                    <Link href="/onboarding">
                      <Button size="sm" variant="outline" className="border-2 border-black hover:bg-black hover:text-white transition-all w-full md:w-auto">
                        Edit Profile ✏️
                      </Button>
                    </Link>
                  )}
                </div>


                {user.bio && <p className="text-xl font-medium mb-4">{user.bio}</p>}

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  {user.university && (
                    <span className="flex items-center gap-1 bg-muted/20 px-2 py-1 rounded border border-black/10">
                      🎓 {user.university}
                    </span>
                  )}
                  {user.education && (
                    <span className="flex items-center gap-1 bg-muted/20 px-2 py-1 rounded border border-black/10">
                      📜 {user.education}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1 bg-muted/20 px-2 py-1 rounded border border-black/10">
                      📍 {user.location}
                    </span>
                  )}
                </div>

                {/* About Me */}
                {user.about && (
                  <div className="mb-6 p-4 bg-muted/10 border-l-4 border-primary rounded-r-md">
                    <h3 className="font-bold text-sm text-primary mb-1 uppercase tracking-wide">About Me</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap font-body">{user.about}</p>
                  </div>
                )}


                {/* Social Links */}
                <div className="flex gap-3">
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub →
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      LinkedIn →
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Portfolio →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border-brutal p-6 bg-primary/5 text-center">
              <p className="text-4xl font-head font-bold text-primary mb-2">
                {user.points}
              </p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="border-brutal p-6 bg-card text-center">
              <p className="text-4xl font-head font-bold mb-2">
                {user.postsPublished}
              </p>
              <p className="text-sm text-muted-foreground">Posts Published</p>
            </div>
            <div className="border-brutal p-6 bg-card text-center">
              <p className="text-4xl font-head font-bold mb-2">
                {user.sparksReceived}
              </p>
              <p className="text-sm text-muted-foreground">Sparks Received</p>
            </div>
            <div className="border-brutal p-6 bg-card text-center">
              <p className="text-4xl font-head font-bold mb-2">
                {user.collaborationsCount}
              </p>
              <p className="text-sm text-muted-foreground">Collaborations</p>
            </div>
          </div>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="border-brutal p-6 bg-accent/5 mb-8">
              <h2 className="font-head text-2xl font-bold mb-4">
                Badges & Achievements
              </h2>
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge: string) => (
                  <Badge
                    key={badge}
                    className="bg-primary text-primary-foreground text-lg px-4 py-2"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          <div>
            <h2 className="font-head text-2xl font-bold mb-6">
              Published Posts ({posts.length})
            </h2>
            {posts.length === 0 ? (
              <div className="border-brutal p-12 text-center bg-card">
                <p className="text-muted-foreground">
                  No published posts yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main >
      <div className="fixed bottom-0 left-0 bg-black text-white p-2 text-xs z-50 opacity-75">
        Debug: LoggedIn={loggedInClerkId?.slice(-5)} | Param={userId?.slice(-5)} | UserClerk={user?.clerkId?.slice(-5)} | Own={isOwnProfile ? 'YES' : 'NO'}
      </div>
    </>
  )
}
