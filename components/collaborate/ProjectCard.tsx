'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { getImageUrl } from '@/lib/sanity/client'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'

interface ProjectCardProps {
  project: {
    _id: string
    projectName: string
    description?: string
    skillsNeeded?: string[]
    duration?: string
    commitment?: string
    postedBy: {
      name: string
      avatar?: any
      tier: number
    }
    applicantCount: number
  }
}


export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useUser()
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false) // In a real app, check 'applicants' array

  const handleApply = async () => {
    if (!user) {
      alert('Please sign in to apply')
      return
    }

    const motivation = prompt('Why are you a good fit for this project? (Optional)')
    if (motivation === null) return // Cancelled

    setIsApplying(true)
    try {
      const res = await fetch('/api/collaborate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project._id,
          applicationText: motivation
        })
      })

      if (!res.ok) throw new Error('Failed to apply')

      setHasApplied(true)
      alert('Application sent successfully! 🚀')
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Card className="border-brutal hover:shadow-brutal transition-all overflow-hidden flex flex-col h-full bg-card">
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Badge className="bg-primary text-primary-foreground">OPEN</Badge>
          <div className="flex items-center gap-1 text-xs font-bold bg-muted px-2 py-1 rounded">
            <span>👥</span>
            <span>{project.applicantCount} Applicants</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-head text-xl font-bold mb-3 line-clamp-2">
          {project.projectName}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {project.description}
          </p>
        )}

        {/* Skills */}
        {project.skillsNeeded && project.skillsNeeded.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.skillsNeeded.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs bg-accent/20 border-accent">
                {skill}
              </Badge>
            ))}
            {project.skillsNeeded.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.skillsNeeded.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t-2 border-black/10 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-semibold text-sm">{project.duration || 'Flexible'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Commitment</p>
            <p className="font-semibold text-sm">{project.commitment || 'Part-time'}</p>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          {project.postedBy.avatar && getImageUrl(project.postedBy.avatar) && (
            <Image
              src={getImageUrl(project.postedBy.avatar)!}
              alt={project.postedBy.name}
              width={24}
              height={24}
              className="rounded-full border border-black"
            />
          )}
          <div className="text-xs">
            <span className="text-muted-foreground">Posted by </span>
            <span className="font-semibold">{project.postedBy.name}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="p-6 pt-0">
        <Button
          onClick={handleApply}
          disabled={isApplying || hasApplied}
          className="w-full border-brutal shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? 'Applying...' : hasApplied ? 'Applied ✅' : 'Apply to Join →'}
        </Button>
      </div>
    </Card>
  )
}
