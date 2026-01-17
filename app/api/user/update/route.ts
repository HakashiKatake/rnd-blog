import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { client } from '@/lib/sanity/client'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { userId, name, bio, about, university, education, isOnboarded } = body

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Find Sanity user ID by Clerk ID
        const sanityUser = await client.fetch(
            `*[_type == "user" && clerkId == $clerkId][0]`,
            { clerkId: userId }
        )

        if (!sanityUser) {
            // Create user if not found
            await client.create({
                _type: 'user',
                clerkId: userId,
                name: name || user.firstName + ' ' + user.lastName || 'New User',
                email: user.emailAddresses[0]?.emailAddress,
                avatar: user.imageUrl,
                bio,
                about,
                university,
                education,
                isOnboarded: true,
                tier: 1,
                points: 0,
                sparksReceived: 0,
                postsPublished: 0,
                collaborationsCount: 0,
                joinedAt: new Date().toISOString(),
            })
        } else {
            // Update user
            await client.patch(sanityUser._id).set({
                name,
                avatar: body.avatar || sanityUser.avatar, // Allow avatar update
                bio,
                about,
                university,
                education,
                isOnboarded: isOnboarded !== undefined ? isOnboarded : sanityUser.isOnboarded,
            }).commit()
        }

        // Force cache refresh
        revalidatePath(`/profile/${userId}`)
        revalidatePath('/')

        return NextResponse.json({ message: 'Profile updated' })

    } catch (error: any) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        )
    }
}
