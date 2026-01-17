import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            console.error('Unauthorized access attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { collectionId, postId, action } = body
        console.log(`[Collection] Manage request: User=${userId}, Action=${action}, Collection=${collectionId}, Post=${postId}`)

        // Verify ownership
        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
        const sanityUserId = await client.fetch(userQuery)

        if (!sanityUserId) {
            console.error('Sanity user not found')
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const collection = await client.fetch(`*[_type == "collection" && _id == $id][0]`, { id: collectionId })

        if (!collection) {
            console.error(`Collection not found: ${collectionId}`)
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
        }

        if (collection.user._ref !== sanityUserId) {
            console.error(`Unauthorized access to collection. Owner: ${collection.user._ref}, Requestor: ${sanityUserId}`)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        if (action === 'add') {
            // Check if already exists
            if (collection.posts?.some((p: any) => p._ref === postId)) {
                console.log('Post already in collection')
                return NextResponse.json({ message: 'Already saved' })
            }

            console.log('Adding post to collection...')
            // Use a simple random string for key to avoid crypto issues in edge/server runtimes if not polyfilled
            const uniqueKey = Math.random().toString(36).substring(2, 10);

            const result = await client
                .patch(collectionId)
                .setIfMissing({ posts: [] })
                .append('posts', [{
                    _type: 'reference',
                    _ref: postId,
                    _key: uniqueKey
                }])
                .commit()
            console.log('Sanity patch result:', result)

        } else if (action === 'remove') {
            console.log('Removing post from collection...')
            await client
                .patch(collectionId)
                .unset([`posts[_ref=="${postId}"]`])
                .commit()
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error managing collection:', error)
        // Check if it's a Sanity error
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}
