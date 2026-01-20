import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client' // Ensure we have a write token server-side if client.ts doesn't export one with token. 
// Note: client.ts usually exports a public read-only client or a client that uses process.env.SANITY_API_TOKEN which should be available server-side.
import { auth } from '@clerk/nextjs/server'
import fs from 'fs'
import path from 'path'

function log(msg: string) {
    try {
        const logPath = path.join(process.cwd(), 'debug-chat.log')
        fs.appendFileSync(logPath, `${new Date().toISOString()}: ${msg}\n`)
    } catch (e) { }
}

export async function POST(req: Request) {
    log('POST /api/collaborate/message called')
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { collaborationId, text } = await req.json()

        if (!collaborationId || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get the Sanity user ID for this Clerk user
        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
        const sanityUserId = await client.fetch(userQuery)

        if (!sanityUserId) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
        }


        // Add message to the collaboration document
        await client
            .patch(collaborationId)
            .setIfMissing({ messages: [] })
            .append('messages', [
                {
                    text,
                    user: { _type: 'reference', _ref: sanityUserId },
                    timestamp: new Date().toISOString()
                }
            ])
            .commit()

        log(`Message sent successfully to ${collaborationId}`)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error sending message:', error)
        log(`Error sending message: ${error.message} \nStack: ${error.stack}`)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
