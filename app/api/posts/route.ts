import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, excerpt, content, tags, userId } = body

        // Create post in Sanity
        const post = await client.create({
            _type: 'post',
            title,
            excerpt,
            content,
            tags: tags || [],
            slug: {
                _type: 'slug',
                current: title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, ''),
            },
            author: {
                _type: 'reference',
                _ref: userId,
            },
            status: 'pending', // Auto-approve for now (TODO: implement moderation)
            sparkCount: 0,
            viewCount: 0,
            publishedAt: new Date().toISOString(),
        })

        return NextResponse.json({
            message: 'Post created successfully',
            slug: post.slug.current,
        })
    } catch (error) {
        console.error('Error creating post:', error)
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        )
    }
}
