'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl, urlFor } from '@/lib/sanity/client'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
import { FaBolt, FaEye } from 'react-icons/fa6'
import { SignedOut, SignedIn } from '@clerk/nextjs'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

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
    isEdited?: boolean
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
    <>
      <Card className="border-brutal hover:shadow-brutal transition-all overflow-hidden group relative">
        {/* Signed In Logic: Normal Navigation */}
        <SignedIn>
          <Link href={`/post/${post.slug.current}`} className="block h-full">
            <PostCardContent post={post} tierEmojis={tierEmojis} tagColors={tagColors} />
          </Link>
        </SignedIn>

        {/* Signed Out Logic: Gated Modal */}
        <SignedOut>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <div className="cursor-pointer h-full">
                <PostCardContent post={post} tierEmojis={tierEmojis} tagColors={tagColors} />
              </div>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border-brutal bg-background p-6 shadow-brutal animate-in zoom-in-95 duration-200">
                <div className="flex flex-col gap-4 text-center">
                  <div className="flex justify-end">
                    <Dialog.Close asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="text-4xl mb-2">🔒</div>
                  <Dialog.Title className="text-2xl font-head font-bold">
                    Get Started to View Full Project
                  </Dialog.Title>
                  <Dialog.Description className="text-muted-foreground">
                    Sign in to explore full project details and collaborate with other engineers.
                  </Dialog.Description>
                  <div className="mt-4">
                    <Link href="/sign-in">
                      <Button className="w-full bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </SignedOut>
      </Card>
    </>
  )
}

function PostCardContent({ post, tierEmojis, tagColors }: { post: any, tierEmojis: string[], tagColors: Record<string, string> }) {
  return (
    <>
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
            {post.tags.slice(0, 2).map((tag: string) => (
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
        {/* Author and Stats */}
        <div className="flex items-center justify-between mt-auto">
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
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Tier {post.author.tier}
                </p>
                {post.isEdited && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium">(edited)</span>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 font-medium text-sm">
            <span className="flex items-center gap-1 text-primary">
              <FaBolt /> {post.sparkCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <FaEye /> {post.viewCount || 0}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
