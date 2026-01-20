import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { collaborationId, messageKey } = await req.json()

        if (!collaborationId || !messageKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Security check: Ensure the user deleting is the author of the message?
        // This requires fetching the message first or using a constrained patch.
        // Sanity patches are powerful. We can unset specific item by key.
        // Ideally we verify authorship.

        // Fetch collaboration to verify author
        const collab = await client.fetch(`*[_type == "collaboration" && _id == $id][0] {
        messages[_key == $key] {
            "authorId": user->clerkId
        }
    }`, { id: collaborationId, key: messageKey })

        const messageAuthor = collab?.messages?.[0]?.authorId

        // Also allow project owner to delete?

        if (messageAuthor !== userId) {
            // Allow if user is project owner? (Skipping for now for speed)
            return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 })
        }

        // Delete the message
        await client
            .patch(collaborationId)
            .unset([`messages[_key=="${messageKey}"]`])
            .commit()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting message:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
