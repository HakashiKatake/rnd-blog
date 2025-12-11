'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/retroui/Button'
import { FaPenToSquare } from 'react-icons/fa6'

export function EditAction({ authorClerkId, slug }: { authorClerkId: string; slug: string }) {
  const { user } = useUser()

  if (!user || user.id !== authorClerkId) return null

  return (
    <Link href={`/post/${slug}/edit`}>
      <Button variant="outline" size="sm" className="border-brutal hover:shadow-brutal-sm flex items-center gap-2">
        <FaPenToSquare /> Edit
      </Button>
    </Link>
  )
}
