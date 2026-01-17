import { auth, currentUser } from '@clerk/nextjs/server'
import { renderToStream } from '@react-pdf/renderer'
import { NextRequest, NextResponse } from 'next/server'
import { client, getImageUrl } from '@/lib/sanity/client'
import { PortfolioPDF } from '@/lib/pdf/PortfolioPDF'

// Ensure Node.js runtime for stream handling
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        const { userId: clerkUserId } = await auth()
        const user = await currentUser()

        // 1. Access Control
        if (!clerkUserId || !userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Strict ownership check: Only allow exporting one's own profile
        // We check against the Clerk ID. If the requested userId is a Sanity ID, we'd need to resolve it.
        // For simplicity and security, we enforce that the 'userId' param MUST match the logged-in Clerk ID
        // OR valid Sanity ID mapping.
        // Let's first fetch the Sanity user and check the clerkId field.

        const sanityUser = await client.fetch(
            `*[_type == "user" && (_id == $userId || clerkId == $userId)][0] {
        _id,
        clerkId,
        name,
        avatar,
        tier,
        university,
        points
      }`,
            { userId }
        )

        if (!sanityUser) {
            return new NextResponse('User not found', { status: 404 })
        }

        if (sanityUser.clerkId !== clerkUserId) {
            return new NextResponse('Forbidden: You can only export your own portfolio', { status: 403 })
        }

        // 2. Data Fetching (Source of Truth)
        // - Posts
        const posts = await client.fetch(
            `*[_type == "post" && author._ref == $sanityId && status == "approved"] | order(publishedAt desc) {
        title,
        publishedAt,
        sparkCount,
        excerpt
      }`,
            { sanityId: sanityUser._id }
        )

        // - Stats computation
        // Using "Option A" logic: Fetch sparkCounts array in GROQ, sum in Node.js
        const statsQuery = `
      {
        "postsPublished": count(*[
          _type == "post" &&
          author._ref == $sanityId &&
          status == "approved"
        ]),

        "sparkCounts": *[
          _type == "post" &&
          author._ref == $sanityId &&
          status == "approved"
        ].sparkCount,

        "questsCompleted": count(*[
          _type == "quest" &&
          $sanityId in participants[]._ref &&
          status == "completed"
        ]),

        "collaborationsJoined": count(*[
          _type == "collaboration" &&
          (
            $sanityId in teamMembers[]._ref ||
            $sanityId in applicants[].user._ref
          )
        ]),
        "managedPoints": $managedPoints
      }
    `
        // We pass managedPoints from the User document to respect the platform's core logic
        const fetchedStats = await client.fetch(statsQuery, {
            sanityId: sanityUser._id,
            managedPoints: sanityUser.points || 0
        })

        // Reduce sparkCounts safely in Node.js
        const sparksReceived = (fetchedStats.sparkCounts || []).reduce(
            (sum: number, value: number) => sum + (value || 0),
            0
        )

        const stats = {
            totalPoints: fetchedStats.managedPoints,
            postsPublished: fetchedStats.postsPublished,
            sparksReceived,
            questsCompleted: fetchedStats.questsCompleted,
            collaborationsJoined: fetchedStats.collaborationsJoined,
        }

        // Prepare User object for PDF
        // Resolve helper image URL
        const avatarUrl = sanityUser.avatar ? getImageUrl(sanityUser.avatar) : ''

        const pdfProps = {
            user: {
                name: sanityUser.name,
                avatar: avatarUrl || undefined,
                tier: sanityUser.tier || 1,
                university: sanityUser.university,
            },
            stats,
            posts,
            generatedAt: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        }

        // 3. Generate PDF Stream
        const stream = await renderToStream(<PortfolioPDF {...pdfProps} />)

        // 4. Return Response
        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="spark-portfolio-${sanityUser.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
            },
        })
    } catch (error: any) {
        console.error('PDF Generation Error:', error)
        return new NextResponse(`Internal Server Error: ${error.message || error}`, { status: 500 })
    }
}
