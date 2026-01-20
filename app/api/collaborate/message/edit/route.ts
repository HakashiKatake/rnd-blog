import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { collaborationId, messageKey, newText } = await req.json()

        if (!collaborationId || !messageKey || !newText) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify authorship
        const collab = await client.fetch(`*[_type == "collaboration" && _id == $id][0] {
        messages[_key == $key] {
            "authorId": user->clerkId
        }
    }`, { id: collaborationId, key: messageKey })

        const messageAuthor = collab?.messages?.[0]?.authorId

        if (messageAuthor !== userId) {
            return NextResponse.json({ error: 'Not authorized to edit this message' }, { status: 403 })
        }

        // Edit the message
        // Sanity patch to update an array item by key is tricky if not using insert/replace.
        // Easier to replace the item or update fields.
        // `messages[_key=="key"].text` works in GROQ-like patches sometimes?
        // Actually Sanity patch API supports path with filter.

        await client
            .patch(collaborationId)
            .set({ [`messages[_key=="${messageKey}"].text`]: newText })
            .commit()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error editing message:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
