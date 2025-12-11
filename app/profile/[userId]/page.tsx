import { client, urlFor, getImageUrl } from '@/lib/sanity/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Navigation } from '@/components/layout/Navigation'
import { PostCard } from '@/components/explore/PostCard'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const user = await client.fetch(
    `*[_type == "user" && (_id == $userId || clerkId == $userId)][0] {
      _id,
      name,
      email,
      avatar,
      bio,
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
      portfolioUrl
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
      tags,
      sparkCount,
      viewCount,
      publishedAt,
      "author": author->{name, avatar, tier}
    }`,
    { userId: user._id } // Use the actual Sanity ID from the fetched user
  )

  const tierNames = ['', 'Spark Initiate', 'Idea Igniter', 'Forge Master', 'RnD Fellow']
  const tierEmojis = ['', '⚡', '🔥', '⚙️', '🏆']

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Profile Header */}
          <div className="border-brutal p-8 bg-card mb-8">
            <div className="flex flex-col md:flex-row gap-6">
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

                {user.bio && <p className="text-muted-foreground mb-4">{user.bio}</p>}

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  {user.university && (
                    <span className="flex items-center gap-1">
                      🎓 {user.university}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1">
                      📍 {user.location}
                    </span>
                  )}
                </div>

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
      </main>
    </>
  )
}
