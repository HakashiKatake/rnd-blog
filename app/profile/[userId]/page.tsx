import { client, getImageUrl } from '@/lib/sanity/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { currentUser } from '@clerk/nextjs/server'
import { Navigation } from '@/components/layout/Navigation'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'
import ProfileDownloadButton from '@/components/profile/ProfileDownloadButton'
import { ProfileContent } from '@/components/profile/ProfileContent'

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

  // 1. Fetch User
  const user = await client.fetch(
    `*[_type == "user" && (_id == $userId || clerkId == $userId)][0] {
      _id,
      clerkId,
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

  const sanityUid = user._id


  // 2. Fetch Content Parallelly
  const [posts, joinedQuests, completedQuests, collaborations] = await Promise.all([
    // Posts
    client.fetch(
      `*[_type == "post" && author._ref == $sanityUid && status == "approved"] | order(publishedAt desc) {
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
      { sanityUid }
    ),
    // Joined Quests (Active/Open)
    client.fetch(
      `*[_type == "quest" && $sanityUid in participants[]._ref && status != "completed"] {
        _id,
        title,
        slug,
        status,
        rewardPoints
      }`,
      { sanityUid }
    ),
    // Completed Quests
    client.fetch(
      `*[_type == "quest" && $sanityUid in participants[]._ref && status == "completed"] {
        _id,
        title,
        slug,
        status,
        rewardPoints
      }`,
      { sanityUid }
    ),
    // Collaborations (Team member or Applicant)
    client.fetch(
      `*[_type == "collaboration" && ($sanityUid in teamMembers[]._ref || $sanityUid in applicants[].user._ref)] {
        _id,
        projectName,
        description,
        status,
        "postedBy": postedBy->{name}
      }`,
      { sanityUid }
    )
  ])

  // 3. Compute Stats Live
  const stats = {
    totalPoints: user.points, // Keep as source of truth from User doc for now
    postsPublished: posts.length,
    sparksReceived: posts.reduce((sum: number, p: any) => sum + (p.sparkCount || 0), 0),
    questsCompleted: completedQuests.length,
    collaborationsJoined: collaborations.length
  }

  // Fetch Collections
  const collections = await client.fetch(
    `*[_type == "collection" && user._ref == $userId] | order(_createdAt desc) {
      _id,
      title,
      description,
      isPrivate,
      "postCount": count(posts),
      posts[]->{
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
      }
    }`,
    { userId: user._id }
  )

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
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className="bg-secondary text-secondary-foreground text-lg">
                        Tier {user.tier}: {tierNames[user.tier]} {tierEmojis[user.tier]}
                      </Badge>
                      <Badge variant="outline" className="bg-muted/50">
                        Verified by ITM RnD Club
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Edit & Download Buttons */}
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
                    {
                      user.githubUrl && (
                        <a
                          href={user.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline hover:text-primary/80 transition-colors"
                        >
                          GitHub →
                        </a>
                      )
                    }
                  {user.linkedinUrl && (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      LinkedIn →
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline hover:text-primary/80 transition-colors"
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
            <div className="border-brutal p-6 bg-primary/5 text-center group hover:bg-primary/10 transition-colors cursor-default">
              <p className="text-4xl font-head font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                {stats.totalPoints}
              </p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="border-brutal p-6 bg-card text-center group hover:border-primary transition-colors cursor-default">
              <p className="text-4xl font-head font-bold mb-2 group-hover:scale-110 transition-transform">
                {stats.postsPublished}
              </p>
              <p className="text-sm text-muted-foreground">Posts Published</p>
            </div>
            <div className="border-brutal p-6 bg-card text-center group hover:border-primary transition-colors cursor-default">
              <p className="text-4xl font-head font-bold mb-2 group-hover:scale-110 transition-transform">
                {stats.sparksReceived}
              </p>
              <p className="text-sm text-muted-foreground">Sparks Received</p>
            </div>
            <div className="border-brutal p-6 bg-card text-center group hover:border-primary transition-colors cursor-default">
              <p className="text-4xl font-head font-bold mb-2 group-hover:scale-110 transition-transform">
                {stats.collaborationsJoined}
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

          {/* Main Content Tabs */}
          <ProfileContent
            user={user}
            posts={posts}
            collections={collections}
            joinedQuests={joinedQuests}
            completedQuests={completedQuests}
            collaborations={collaborations}
            isOwnProfile={!!isOwnProfile}
          />
        </div>
      </main>
    </>
  )
}

