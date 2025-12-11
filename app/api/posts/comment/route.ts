import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { postId, text } = await req.json()

        if (!postId || !text) {
            return NextResponse.json({ error: 'Post ID and text required' }, { status: 400 })
        }

        // 1. Get Sanity User ID from Clerk ID
        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
        const sanityUserId = await client.fetch(userQuery)

        if (!sanityUserId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Add Comment to Post
        const result = await client
            .patch(postId)
            .setIfMissing({ comments: [] })
            .append('comments', [
                {
                    _type: 'comment',
                    user: {
                        _type: 'reference',
                        _ref: sanityUserId,
                    },
                    text,
                    createdAt: new Date().toISOString(),
                    sparkCount: 0,
                    _key: Math.random().toString(36).substring(7),
                },
            ])
            .commit()

        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error('Error adding comment:', error)
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
    }
}
