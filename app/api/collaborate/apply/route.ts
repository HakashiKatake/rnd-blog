import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { projectId, applicationText } = await req.json()

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
        }

        // 1. Get Sanity User ID from Clerk ID
        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
        const sanityUserId = await client.fetch(userQuery)

        if (!sanityUserId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Add User to Applicants Array
        // Use Sanity 'patch' to append to the array
        const result = await client
            .patch(projectId)
            .setIfMissing({ applicants: [] })
            .append('applicants', [
                {
                    user: {
                        _type: 'reference',
                        _ref: sanityUserId,
                    },
                    applicationText: applicationText || '',
                    appliedAt: new Date().toISOString(),
                    status: 'pending',
                    _key: Math.random().toString(36).substring(7), // Generate random key
                },
            ])
            .commit()

        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error('Error applying to project:', error)
        return NextResponse.json({ error: 'Failed to apply' }, { status: 500 })
    }
}
