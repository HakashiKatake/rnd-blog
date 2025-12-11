import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { questId } = await req.json()

        if (!questId) {
            return NextResponse.json({ error: 'Quest ID required' }, { status: 400 })
        }

        // 1. Get Sanity User ID from Clerk ID
        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
        const sanityUserId = await client.fetch(userQuery)

        if (!sanityUserId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Add User to Participants Array
        // Use Sanity 'patch' to append to unique array
        const result = await client
            .patch(questId)
            .setIfMissing({ participants: [] })
            .append('participants', [
                {
                    _type: 'reference',
                    _ref: sanityUserId,
                    _key: Math.random().toString(36).substring(7),
                },
            ])
            .commit()

        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error('Error joining quest:', error)
        return NextResponse.json({ error: 'Failed to join quest' }, { status: 500 })
    }
}
