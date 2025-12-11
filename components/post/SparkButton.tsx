'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/retroui/Button'

export function SparkButton({
  postId,
  initialSparkCount,
}: {
  postId: string
  initialSparkCount: number
}) {
  const { user } = useUser()
  const [sparkCount, setSparkCount] = useState(initialSparkCount)
  const [isSparked, setIsSparked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSpark = async () => {
    if (!user) {
      alert('Please sign in to spark posts!')
      return
    }

    if (isSparked) {
      return // Already sparked
    }

    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 400)

    // Optimistic update
    setIsSparked(true)
    setSparkCount((prev) => prev + 1)

    try {
      const response = await fetch('/api/posts/spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        // Revert on error
        setIsSparked(false)
        setSparkCount((prev) => prev - 1)
        alert('Failed to spark post. Please try again.')
      }
    } catch (error) {
      console.error('Error sparking post:', error)
      setIsSparked(false)
      setSparkCount((prev) => prev - 1)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleSpark}
        disabled={isSparked}
        className={`border-brutal shadow-brutal hover:shadow-brutal-sm transition-all ${
          isSparked
            ? 'bg-primary text-primary-foreground cursor-not-allowed'
            : 'bg-background hover:bg-primary/10'
        }`}
      >
        <span className="text-xl mr-2">⚡</span>
        <span className="font-bold">
          {isSparked ? 'Sparked!' : 'Spark'} ({sparkCount})
        </span>
      </Button>

      {/* Particle Burst Animation */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full animate-spark-burst"
              style={{
                '--x': `${Math.cos((i * Math.PI) / 3) * 50}px`,
                '--y': `${Math.sin((i * Math.PI) / 3) * 50}px`,
                animationDelay: `${i * 20}ms`,
              } as any}
            />
          ))}
        </div>
      )}
    </div>
  )
}
