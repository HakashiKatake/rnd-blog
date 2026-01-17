import { client, queries } from '@/lib/sanity/client'
import { Navigation } from '@/components/layout/Navigation'
import { PostCard } from '@/components/explore/PostCard'
import { FilterBar } from '@/components/explore/FilterBar'
import { getOrCreateUser } from "@/lib/auth/user"; // Import user helper
import { redirect } from "next/navigation";

// Force dynamic rendering to ensure searchParams work correctly
export const dynamic = 'force-dynamic'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; search?: string }>
}) {
  const { tag, search } = await searchParams




  // Build query with filters
  let query = `*[_type == "post" && status == "approved"]`

  if (tag) {
    // Check if tags exists and contains the tag
    query += ` && defined(tags) && $tag in tags`
  }

  if (search) {
    query += ` && (title match $search || excerpt match $search)`
  }

  query += ` | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    thumbnail,
    coverImageUrl,
    tags,
    "sparkCount": coalesce(sparkCount, 0),
    viewCount,
    publishedAt,
    "author": author->{name, avatar, tier}
  }`

  // Fetch with fresh data (bypass CDN/Cache for search)
  const posts = await client.fetch(query,
    { tag: tag || '', search: search ? `*${search}*` : '' },
    { cache: 'no-store', next: { revalidate: 0 } }
  )

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-4 border-black bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-head text-4xl lg:text-6xl font-bold mb-4">
              Explore Research
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover peer-curated engineering projects, research, and
              innovations from students around the world.
            </p>
          </div>
        </section>

        {/* Filters */}
        <FilterBar currentTag={tag} currentSearch={search} />

        {/* Posts Grid */}
        <section className="container mx-auto px-4 py-12">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="font-head text-2xl font-bold mb-2">
                No posts found
              </h2>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
