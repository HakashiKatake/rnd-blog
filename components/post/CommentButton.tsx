'use client'

import { useState } from 'react'
import { Button } from '@/components/retroui/Button'

interface CommentButtonProps {
  postId: string
}

export function CommentButton({ postId }: CommentButtonProps) {
  const [showComments, setShowComments] = useState(false)

  const handleClick = () => {
    setShowComments(!showComments)
    // Scroll to comments section if it exists
    const element = document.getElementById('comments-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
    >
      💬 Comment
    </Button>
  )
}
