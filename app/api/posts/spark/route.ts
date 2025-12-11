import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { currentUser } from '@clerk/nextjs/server'
import { awardPoints } from '@/lib/auth/user'

export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { postId } = await request.json()

        // Increment spark count on post
        await client.patch(postId).inc({ sparkCount: 1 }).commit()

        // Get post to find author
        const post = await client.fetch(
            `*[_type == "post" && _id == $postId][0]{ "authorId": author._ref }`,
            { postId }
        )

        if (post?.authorId) {
            // Award points to post author
            await awardPoints(post.authorId, 1, 'Received a spark')

            // Update author's sparks received count
            await client
                .patch(post.authorId)
                .inc({ sparksReceived: 1 })
                .commit()
        }

        // Award 0.5 points to the user who sparked (optional - encourages engagement)
        const userRecord = await client.fetch(
            `*[_type == "user" && clerkId == $clerkId][0]`,
            { clerkId: clerkUser.id }
        )

        if (userRecord) {
            await awardPoints(userRecord._id, 0.5, 'Sparked a post')
        }

        return NextResponse.json({ message: 'Post sparked successfully' })
    } catch (error) {
        console.error('Error sparking post:', error)
        return NextResponse.json(
            { error: 'Failed to spark post' },
            { status: 500 }
        )
    }
}
