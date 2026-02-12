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

        // 2. Deterministic ID for Idempotency
        // This ensures a user can only be a participant ONCE per quest
        const participantId = `questParticipant-${questId}-${sanityUserId}`

        // 3. Create Participation Document safely
        const result = await client.createIfNotExists({
            _id: participantId,
            _type: 'questParticipant',
            quest: {
                _type: 'reference',
                _ref: questId
            },
            user: {
                _type: 'reference',
                _ref: sanityUserId
            },
            status: 'active',
            joinedAt: new Date().toISOString()
        })

        return NextResponse.json({ success: true, result })
    } catch (error: any) {
        console.error('Error joining quest:', error)
        console.error('Stack:', error.stack)
        return NextResponse.json({
            error: 'Failed to join quest',
            details: error.message || 'Unknown error'
        }, { status: 500 })
    }
}
