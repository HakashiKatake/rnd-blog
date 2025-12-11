'use client'

import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { getImageUrl, urlFor } from '@/lib/sanity/client'
import { toast } from 'sonner'
import { FaRocket, FaClock, FaTrophy, FaUsers } from 'react-icons/fa6'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'

interface QuestCardProps {
  quest: {
    _id: string
    title: string
    description?: string
    status: 'open' | 'active'
    difficulty: 'easy' | 'medium' | 'hard'
    rewardPoints: number
    daysRemaining?: number
    proposedBy: {
      name: string
      avatar?: any
    }
    participantCount: number
  }
}

export function QuestCard({ quest }: QuestCardProps) {
  const { user } = useUser()
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false) // Optimistic UI

  const handleJoin = async () => {
    if (!user) {
      toast.error('Please sign in to join a quest')
      return
    }

    if (!confirm('Are you sure you want to join this quest?')) return

    setIsJoining(true)
    try {
      const res = await fetch('/api/quests/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest._id })
      })

      if (!res.ok) throw new Error('Failed to join quest')

      setHasJoined(true)
      toast.success('You have joined the quest! 🚀')
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const difficultyColors = {
    easy: 'bg-success text-white',
    medium: 'bg-accent text-accent-foreground',
    hard: 'bg-destructive text-white',
  }

  const statusColors = {
    open: 'bg-primary text-primary-foreground',
    active: 'bg-secondary text-secondary-foreground',
  }

  return (
    <Card className="border-brutal hover:shadow-brutal transition-all overflow-hidden flex flex-col h-full bg-card">
      <div className="p-6 flex-1">
        {/* Status & Difficulty */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={statusColors[quest.status]}>
            {quest.status.toUpperCase()}
          </Badge>
          <Badge className={difficultyColors[quest.difficulty]}>
            {quest.difficulty.toUpperCase()}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-head text-xl font-bold mb-3 line-clamp-2">
          {quest.title}
        </h3>

        {/* Description */}
        {quest.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {quest.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between py-3 border-t-2 border-black mb-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><FaTrophy /> Reward</p>
            <p className="font-bold text-primary">+{quest.rewardPoints} pts</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><FaUsers /> Participants</p>
            <p className="font-bold">{quest.participantCount + (hasJoined ? 1 : 0)}</p>
          </div>
          {quest.daysRemaining && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><FaClock /> Time Left</p>
              <p className="font-bold">{quest.daysRemaining}d</p>
            </div>
          )}
        </div>

        {/* Proposed By */}
        <div className="flex items-center gap-2 mb-4">
          {quest.proposedBy.avatar && getImageUrl(quest.proposedBy.avatar) && (
            <Image
              src={getImageUrl(quest.proposedBy.avatar)!}
              alt={quest.proposedBy.name}
              width={24}
              height={24}
              className="rounded-full border border-black"
            />
          )}
          <p className="text-xs text-muted-foreground">
            by <span className="font-semibold">{quest.proposedBy.name}</span>
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="p-6 pt-0">
        <Button
          onClick={handleJoin}
          disabled={isJoining || hasJoined || quest.status !== 'open'}
          className="w-full bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isJoining ? 'Joining...' : hasJoined ? 'Joined 🚀' : quest.status === 'open' ? <><FaRocket /> Join Quest</> : 'View Details'}
        </Button>
      </div>
    </Card>
  )
}
