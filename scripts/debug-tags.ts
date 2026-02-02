/**
 * Debug script to test exact explore page query
 */

import { createClient } from '@sanity/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2024-01-01',
    useCdn: false,
})

async function debug() {
    const tag = 'ai-ml'

    // Exact query from explore page
    let query = `*[_type == "post" && status == "approved"]`
    query += ` && defined(tags) && count(tags[lower(@) == lower($tag)]) > 0`
    query += ` | order(publishedAt desc) {
    _id,
    title,
    tags,
    "author": author->{name}
  }`

    console.log('Query:', query)
    console.log('Params:', { tag })

    const posts = await client.fetch(query, { tag })
    console.log('\nResults:')
    console.log(JSON.stringify(posts, null, 2))
}

debug()
