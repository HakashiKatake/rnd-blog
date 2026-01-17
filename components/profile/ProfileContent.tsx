"use client"

import { useState } from 'react'
import { PostCard } from "@/components/explore/PostCard"
import { QuestList } from './QuestList'
import { CollaborationList } from './CollaborationList'
import { ExportPortfolioButton } from './ExportPortfolioButton'
import * as Tabs from '@radix-ui/react-tabs'
import { useClerk } from '@clerk/nextjs'
import { Button } from '@/components/retroui/Button'
import { Settings } from 'lucide-react'
import { FaLayerGroup } from "react-icons/fa6"

// Reusing styles from other components or inline for brutalist look
const tabTriggerClass = "flex items-center gap-2 px-6 py-3 font-head font-bold text-lg border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary hover:text-primary transition-colors cursor-pointer"

interface ProfileContentProps {
    user: any
    posts: any[]
    collections?: any[]
    joinedQuests: any[]
    completedQuests: any[]
    collaborations: any[]
    isOwnProfile: boolean
}

export function ProfileContent({
    user,
    posts,
    collections = [],
    joinedQuests,
    completedQuests,
    collaborations,
    isOwnProfile
}: ProfileContentProps) {
    const { openUserProfile } = useClerk()

    return (
        <div className="mt-8">
            {/* Actions Row - Only for Owner */}
            {isOwnProfile && (
                <div className="flex flex-wrap gap-4 mb-8 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => openUserProfile()}
                        className="flex items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Manage Account
                    </Button>
                    <ExportPortfolioButton userId={user._id} />
                </div>
            )}

            <Tabs.Root defaultValue="posts" className="w-full">
                <Tabs.List className="flex border-b-2 border-border mb-8 overflow-x-auto">
                    <Tabs.Trigger value="posts" className={tabTriggerClass}>
                        Published Research ({posts.length})
                    </Tabs.Trigger>
                    {collections.length > 0 && (
                        <Tabs.Trigger value="collections" className={tabTriggerClass}>
                            <FaLayerGroup /> Collections ({collections.length})
                        </Tabs.Trigger>
                    )}
                    <Tabs.Trigger value="quests" className={tabTriggerClass}>
                        Quests ({joinedQuests.length + completedQuests.length})
                    </Tabs.Trigger>
                    <Tabs.Trigger value="collabs" className={tabTriggerClass}>
                        Collaborations ({collaborations.length})
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="posts" className="outline-none">
                    {posts.length === 0 ? (
                        <div className="border-brutal p-12 text-center bg-card">
                            <p className="text-muted-foreground">No published posts yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                    )}
                </Tabs.Content>

                <Tabs.Content value="collections" className="outline-none">
                    <div className="space-y-8">
                        {collections.length === 0 ? (
                            <div className="border-brutal p-12 text-center bg-card">
                                <p className="text-muted-foreground">No collections created yet.</p>
                            </div>
                        ) : (
                            collections.map(collection => (
                                (!collection.isPrivate || isOwnProfile) && (
                                    <div key={collection._id} className="border-brutal p-6 bg-card">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-head text-2xl font-bold flex items-center gap-2">
                                                    {collection.title}
                                                    {collection.isPrivate && <span className="text-xs bg-muted px-2 py-1 rounded border border-black/20">Private</span>}
                                                </h3>
                                                {collection.description && <p className="text-muted-foreground">{collection.description}</p>}
                                            </div>
                                            <div className="text-sm font-bold bg-primary/20 px-3 py-1 rounded-full">
                                                {collection.postCount || 0} Items
                                            </div>
                                        </div>

                                        {collection.posts && collection.posts.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                                {/* Deduplicate posts to prevent key errors from legacy bad data */}
                                                {Array.from(new Map(collection.posts.map((p: any) => [p._id, p])).values()).map((post: any) => (
                                                    <PostCard key={post._id} post={{ ...post, isBookmarked: true }} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No posts in this collection.</p>
                                        )}
                                    </div>
                                )
                            ))
                        )}
                    </div>
                </Tabs.Content>

                <Tabs.Content value="quests" className="outline-none">
                    <div className="space-y-8">
                        <section>
                            <h3 className="font-head text-xl font-bold mb-4 flex items-center gap-2">
                                <span>Active Quests</span>
                                <span className="text-muted-foreground text-sm font-normal">({joinedQuests.length})</span>
                            </h3>
                            <QuestList quests={joinedQuests} emptyMessage="Not currently participating in any quests." />
                        </section>

                        <section>
                            <h3 className="font-head text-xl font-bold mb-4 flex items-center gap-2">
                                <span>Completed Quests</span>
                                <span className="text-muted-foreground text-sm font-normal">({completedQuests.length})</span>
                            </h3>
                            <QuestList quests={completedQuests} emptyMessage="No completed quests yet." />
                        </section>
                    </div>
                </Tabs.Content>

                <Tabs.Content value="collabs" className="outline-none">
                    <CollaborationList collaborations={collaborations} />
                </Tabs.Content>

            </Tabs.Root>
        </div>
    )
}
