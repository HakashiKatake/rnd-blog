'use client'

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/retroui/Card'
import { getImageUrl } from '@/lib/sanity/client'
import { Badge } from '@/components/retroui/Badge'

interface TeamSidebarProps {
    members: any[]
    postedBy: any
}

export function TeamSidebar({ members, postedBy }: TeamSidebarProps) {
    return (
        <Card className="h-full border-brutal bg-card p-4">
            <h3 className="font-bold text-lg mb-4">Team Members</h3>

            <div className="space-y-4">
                {/* Owner */}
                <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                    <div className="relative">
                        {postedBy.avatar && (
                            <Image
                                src={getImageUrl(postedBy.avatar)!}
                                alt={postedBy.name}
                                width={40}
                                height={40}
                                className="rounded-full border border-black"
                            />
                        )}
                        <Badge className="absolute -bottom-2 -right-2 text-[8px] px-1 py-0 h-4 bg-yellow-400 text-black border border-black">
                            LEAD
                        </Badge>
                    </div>
                    <div>
                        <p className="font-bold text-sm">{postedBy.name}</p>
                        <p className="text-xs text-muted-foreground">Project Lead</p>
                    </div>
                </div>

                {/* Members */}
                {members?.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                        <div>
                            {member.avatar ? (
                                <Image
                                    src={getImageUrl(member.avatar)!}
                                    alt={member.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full border border-black"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 border border-black flex items-center justify-center font-bold">
                                    {member.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.university || 'Collaborator'}</p>
                        </div>
                    </div>
                ))}

                {(!members || members.length === 0) && (
                    <p className="text-muted-foreground text-xs italic">No other members yet.</p>
                )}
            </div>
        </Card>
    )
}
