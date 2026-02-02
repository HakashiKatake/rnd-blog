/**
 * Script to normalize all post tags to lowercase in Sanity
 * Run with: npx tsx scripts/fix-tags.ts
 */

import { createClient } from '@sanity/client'
import { config } from 'dotenv'

// Load .env.local
config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN, // You need a write token
})

async function fixTags() {
    console.log('🔍 Fetching all posts with tags...')

    // Fetch all posts that have tags
    const posts = await client.fetch(`*[_type == "post" && defined(tags)] {
    _id,
    title,
    tags
  }`)

    console.log(`📝 Found ${posts.length} posts with tags`)

    let fixedCount = 0

    for (const post of posts) {
        const originalTags = post.tags || []
        const normalizedTags = originalTags.map((tag: string) => tag.toLowerCase())

        // Check if any tag changed
        const needsUpdate = originalTags.some((tag: string, i: number) => tag !== normalizedTags[i])

        if (needsUpdate) {
            console.log(`\n📌 Fixing: "${post.title}"`)
            console.log(`   Before: [${originalTags.join(', ')}]`)
            console.log(`   After:  [${normalizedTags.join(', ')}]`)

            await client
                .patch(post._id)
                .set({ tags: normalizedTags })
                .commit()

            fixedCount++
        }
    }

    console.log(`\n✅ Done! Fixed ${fixedCount} posts.`)
}

fixTags().catch(console.error)
