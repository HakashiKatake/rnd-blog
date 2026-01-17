"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { PostCard } from "@/components/explore/PostCard"
import { FaLayerGroup, FaPenNib } from "react-icons/fa6"

interface ProfileContentProps {
    user: any
    posts: any[]
    collections: any[]
    isOwnProfile: boolean
}

export function ProfileContent({ user, posts, collections, isOwnProfile }: ProfileContentProps) {
    return (
        <Tabs defaultValue="posts" className="w-full">
            <TabsList className="flex border-b-2 border-black mb-8">
                <TabsTrigger
                    value="posts"
                    className="flex items-center gap-2 px-6 py-3 font-bold border-r-2 border-black/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all hover:bg-primary/10"
                >
                    <FaPenNib /> Published Posts ({posts.length})
                </TabsTrigger>
                <TabsTrigger
                    value="collections"
                    className="flex items-center gap-2 px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all hover:bg-primary/10"
                >
                    <FaLayerGroup /> Collections ({collections.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
                {posts.length === 0 ? (
                    <div className="border-brutal p-12 text-center bg-card">
                        <p className="text-muted-foreground">No published posts yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post: any) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="collections">
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
            </TabsContent>
        </Tabs>
    )
}
