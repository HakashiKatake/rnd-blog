'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl, urlFor } from '@/lib/sanity/client'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'

interface PostCardProps {
  post: {
    _id: string
    title: string
    slug: { current: string }
    excerpt?: string
    thumbnail?: any
    tags?: string[]
    sparkCount: number
    viewCount: number
    publishedAt: string
    author: {
      name: string
      avatar?: any
      tier: number
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const tierEmojis = ['', '⚡', '🔥', '⚙️', '🏆']
  const tagColors: Record<string, string> = {
    'ai-ml': 'bg-accent text-accent-foreground',
    'iot': 'bg-secondary text-secondary-foreground',
    'web3': 'bg-primary text-primary-foreground',
    'security': 'bg-destructive text-white',
    'devops': 'bg-muted text-foreground',
  }

  return (
    <Card className="border-brutal hover:shadow-brutal transition-all overflow-hidden group">
      <Link href={`/post/${post.slug.current}`}>
        {/* Thumbnail */}
        {post.thumbnail && (
          <div className="relative w-full h-48 overflow-hidden border-b-2 border-black">
            <Image
              src={urlFor(post.thumbnail).width(400).height(300).url()}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  className={`${tagColors[tag] || 'bg-muted'} text-xs`}
                >
                  {tag.toUpperCase().replace('-', '/')}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-head text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author.avatar && getImageUrl(post.author.avatar) && (
                <Image
                  src={getImageUrl(post.author.avatar)!}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full border border-black"
                />
              )}
              <div>
                <p className="text-sm font-semibold">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  Tier {post.author.tier} {tierEmojis[post.author.tier]}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                ⚡ {post.sparkCount}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                👁 {post.viewCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}
