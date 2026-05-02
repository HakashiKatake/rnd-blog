import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/auth/user'

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

        // 1. Ensure the current Clerk user is linked to a Sanity user
        const sanityUser = await getOrCreateUser()
        const sanityUserId = sanityUser?._id

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
