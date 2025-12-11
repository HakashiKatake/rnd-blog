import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'

// API endpoint to approve all pending posts
// GET /api/admin/approve-posts
export async function GET(request: NextRequest) {
    try {
        // Find all pending posts
        const pendingPosts = await client.fetch(
            '*[_type == "post" && status == "pending"]{ _id, title }'
        )

        if (pendingPosts.length === 0) {
            return NextResponse.json({ message: 'No pending posts found' })
        }

        // Approve each post
        const results = []
        for (const post of pendingPosts) {
            await client.patch(post._id).set({ status: 'approved' }).commit()
            results.push({ title: post.title, status: 'approved' })
        }

        return NextResponse.json({
            message: `Approved ${results.length} posts`,
            posts: results,
        })
    } catch (error) {
        console.error('Error approving posts:', error)
        return NextResponse.json(
            { error: 'Failed to approve posts' },
            { status: 500 }
        )
    }
}
