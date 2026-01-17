import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
        const sanityUserId = await client.fetch(userQuery)

        if (!sanityUserId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const collections = await client.fetch(
            `*[_type == "collection" && user._ref == $userId] | order(_createdAt desc) {
                _id,
                title,
                description,
                isPrivate,
                "postCount": count(posts),
                posts[]->{_id, title, slug, thumbnail}
            }`,
            { userId: sanityUserId }
        )

        return NextResponse.json({ collections })
    } catch (error) {
        console.error('Error fetching collections:', error)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { title, description, isPrivate } = await req.json()

        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
        const sanityUserId = await client.fetch(userQuery)

        if (!sanityUserId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const newCollection = await client.create({
            _type: 'collection',
            title,
            description,
            isPrivate: isPrivate ?? true,
            user: { _type: 'reference', _ref: sanityUserId },
            posts: []
        })

        return NextResponse.json({ collection: newCollection })
    } catch (error) {
        console.error('Error creating collection:', error)
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
