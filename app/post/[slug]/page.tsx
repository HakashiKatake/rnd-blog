import { client, queries, getImageUrl, urlFor } from '@/lib/sanity/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Navigation } from '@/components/layout/Navigation'
import { SparkButton } from '@/components/post/SparkButton'
import { ShareButton } from '@/components/post/ShareButton'
import { Comments } from '@/components/post/Comments'
import { CommentButton } from '@/components/post/CommentButton'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await client.fetch(queries.getPostBySlug(slug))

  if (!post) {
    notFound()
  }

  // Increment view count
  await client.patch(post._id).inc({ viewCount: 1 }).commit()

  const tierNames = ['', 'Spark Initiate', 'Idea Igniter', 'Forge Master', 'RnD Fellow']
  const tierEmojis = ['', '⚡', '🔥', '⚙️', '🏆']

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string) => (
                  <Badge key={tag} className="bg-primary text-primary-foreground">
                    {tag.toUpperCase().replace('-', '/')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-head text-4xl lg:text-5xl font-bold mb-6">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center justify-between border-y-2 border-black py-4">
              <div className="flex items-center gap-3">
                {post.author.avatar && getImageUrl(post.author.avatar) && (
                  <Image
                    src={getImageUrl(post.author.avatar)!}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-black"
                  />
                )}
                <div>
                  <p className="font-head font-bold">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Tier {post.author.tier} {tierEmojis[post.author.tier]} •{' '}
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  ⚡ {post.sparkCount}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  👁 {post.viewCount}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {post.thumbnail && (
              <div className="my-8 border-brutal overflow-hidden">
                <Image
                  src={urlFor(post.thumbnail).width(800).height(450).url()}
                  alt={post.title}
                  width={800}
                  height={450}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-muted-foreground italic mb-8 border-l-4 border-primary pl-4">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-brutal prose-lg max-w-none mb-12 break-words overflow-hidden">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="border-2 border-black overflow-x-auto"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-muted border border-black px-1 py-0.5 break-all"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                h1: ({ children }) => (
                  <h1 className="font-head text-3xl font-bold mt-8 mb-4 border-b-2 border-black pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-head text-2xl font-bold mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-head text-xl font-bold mt-4 mb-2">
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4">
                    {children}
                  </blockquote>
                ),
                p: ({ children }) => (
                  <p className="break-words overflow-wrap-break-word">
                    {children}
                  </p>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Engagement Actions */}
          <div className="border-y-2 border-black py-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <SparkButton postId={post._id} initialSparkCount={post.sparkCount} />
              <CommentButton postId={post._id} />
              <ShareButton title={post.title} slug={slug} />
            </div>
          </div>

          {/* Comments Section */}
          <Comments postId={post._id} initialComments={post.comments || []} />

          {/* Author Bio */}
          {post.author.bio && (
            <div className="border-brutal p-6 bg-card mb-8">
              <h3 className="font-head text-xl font-bold mb-3">About the Author</h3>
              <div className="flex items-start gap-4">
                {post.author.avatar && getImageUrl(post.author.avatar) && (
                  <Image
                    src={getImageUrl(post.author.avatar)!}
                    alt={post.author.name}
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-black"
                  />
                )}
                <div>
                  <p className="font-bold mb-1">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tierNames[post.author.tier]} {tierEmojis[post.author.tier]}
                  </p>
                  <p className="text-sm">{post.author.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quest Link */}
          {post.quest && (
            <div className="border-brutal-thick p-6 bg-accent/10 mb-8">
              <p className="text-sm text-muted-foreground mb-2">
                Part of the Quest:
              </p>
              <h3 className="font-head text-xl font-bold">
                {post.quest.title}
              </h3>
              <Button
                className="mt-3 bg-accent text-accent-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
              >
                View Quest →
              </Button>
            </div>
          )}
        </article>
      </main>
    </>
  )
}
