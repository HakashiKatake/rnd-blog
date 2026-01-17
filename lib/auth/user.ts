import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/sanity/client'

/**
 * Get or create user in Sanity when they sign in with Clerk
 */
export async function getOrCreateUser() {
    const clerkUser = await currentUser()

    if (!clerkUser) {
        return null
    }

    // Check if user exists in Sanity
    const existingUser = await client.fetch(
        `*[_type == "user" && clerkId == $clerkId][0]`,
        { clerkId: clerkUser.id }
    )

    if (existingUser) {
        return existingUser
    }

    // Create new user in Sanity
    const newUser = await client.create({
        _type: 'user',
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        avatar: clerkUser.imageUrl,
        tier: 1, // Spark Initiate
        points: 0,
        sparksReceived: 0,
        postsPublished: 0,
        collaborationsCount: 0,
        badges: [],
        isOnboarded: false,
    })

    return newUser
}

/**
 * Calculate tier based on points and activity
 */
export function calculateTier(user: {
    points: number
    postsPublished: number
    sparksReceived: number
}): number {
    const { points, postsPublished, sparksReceived } = user

    // Tier 4: RnD Fellow (1000+ points, top 5%)
    if (points >= 1000) return 4

    // Tier 3: Forge Master (250+ points, 5+ posts, 50+ sparks)
    if (points >= 250 && postsPublished >= 5 && sparksReceived >= 50) return 3

    // Tier 2: Idea Igniter (50+ points, 1+ posts, 5+ comments)
    if (points >= 50 && postsPublished >= 1) return 2

    // Tier 1: Spark Initiate (default)
    return 1
}

/**
 * Award points to user
 */
export async function awardPoints(
    userId: string,
    points: number,
    reason: string
) {
    const user = await client.fetch(`*[_type == "user" && _id == $userId][0]`, {
        userId,
    })

    if (!user) return

    const newPoints = user.points + points
    const newTier = calculateTier({
        points: newPoints,
        postsPublished: user.postsPublished,
        sparksReceived: user.sparksReceived,
    })

    await client.patch(userId).set({ points: newPoints, tier: newTier }).commit()

    console.log(`Awarded ${points} points to ${user.name} for: ${reason}`)
}
