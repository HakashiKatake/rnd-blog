import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Set to false if you need fresh data
  token: process.env.SANITY_API_TOKEN, // Required for write operations
})

// Helper for generating image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Helper to get image URL (handles both Sanity images and external URLs)
export function getImageUrl(source: any): string | null {
  if (!source) return null

  // If it's a string (external URL like Clerk avatar), return directly
  if (typeof source === 'string') {
    return source
  }

  // If it's a Sanity image reference, use urlFor
  if (source._type === 'image' || source.asset) {
    return urlFor(source).url()
  }

  return null
}

// Common query helpers
export const queries = {
  // Get all approved posts
  getAllPosts: `*[_type == "post" && status == "approved"] | order(publishedAt desc) {
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

  // Get single post by slug
  getPostBySlug: (slug: string) => `*[_type == "post" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    content,
    excerpt,
    thumbnail,
    tags,
    sparkCount,
    viewCount,
    publishedAt,
    "author": author->{_id, name, avatar, tier, bio},
    "comments": comments[] | order(createdAt desc) {
      _key,
      text,
      createdAt,
      sparkCount,
      "user": user->{name, avatar, tier}
    },
    "quest": quest->{title, slug}
  }`,

  // Get all active quests
  getActiveQuests: `*[_type == "quest" && status in ["open", "active"]] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    status,
    difficulty,
    rewardPoints,
    daysRemaining,
    "proposedBy": proposedBy->{name, avatar},
    "participantCount": count(participants)
  }`,

  // Get user by Clerk ID
  getUserByClerkId: (clerkId: string) => `*[_type == "user" && clerkId == "${clerkId}"][0] {
    _id,
    name,
    email,
    avatar,
    bio,
    university,
    tier,
    points,
    sparksReceived,
    postsPublished,
    collaborationsCount,
    badges
  }`,

  // Get open collaborations
  getOpenCollaborations: `*[_type == "collaboration" && status == "open"] | order(_createdAt desc) {
    _id,
    projectName,
    description,
    skillsNeeded,
    duration,
    commitment,
    "postedBy": postedBy->{name, avatar, tier},
    "applicantCount": count(applicants)
  }`,

  // Get leaderboard users
  getLeaderboard: `*[_type == "user"] | order(points desc)[0...50] {
    _id,
    name,
    avatar,
    tier,
    points,
    sparksReceived,
    postsPublished,
    collaborationsCount,
    university
  }`,
}
