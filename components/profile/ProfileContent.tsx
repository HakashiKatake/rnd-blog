"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/explore/PostCard";
import { FaLayerGroup, FaPenNib, FaBoxOpen } from "react-icons/fa6";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";

interface ProfileContentProps {
  user: any;
  posts: any[];
  collections: any[];
  isOwnProfile: boolean;
}

export function ProfileContent({
  user,
  posts,
  collections,
  isOwnProfile,
}: ProfileContentProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b-2 border-brutal bg-transparent p-0 h-auto gap-2 mb-8 rounded-none">
        <TabsTrigger
          value="posts"
          className="rounded-t-lg rounded-b-none border-2 border-transparent data-[state=active]:border-brutal data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:shadow-none px-6 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground translate-y-[2px]"
        >
          <FaPenNib className="mr-2" /> Posts ({posts.length})
        </TabsTrigger>
        <TabsTrigger
          value="collections"
          className="rounded-t-lg rounded-b-none border-2 border-transparent data-[state=active]:border-brutal data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:shadow-none px-6 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground translate-y-[2px]"
        >
          <FaLayerGroup className="mr-2" /> Collections ({collections.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-0">
        {posts.length === 0 ? (
          <div className="border-2 border-dashed border-brutal rounded-xl p-16 text-center bg-card/50">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBoxOpen className="text-4xl text-muted-foreground/50" />
            </div>
            <h3 className="font-head text-xl font-bold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isOwnProfile
                ? "Share your research journey with the community. Create your first post now!"
                : "This user hasn't published any research posts yet."}
            </p>
            {isOwnProfile && (
              <Link href="/create">
                <Button className="bg-primary text-primary-foreground border-2 border-brutal shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  Create Post +
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="collections" className="mt-0">
        <div className="space-y-8">
          {collections.length === 0 ? (
            <div className="border-2 border-dashed border-brutal rounded-xl p-16 text-center bg-card/50">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaLayerGroup className="text-4xl text-muted-foreground/50" />
              </div>
              <h3 className="font-head text-xl font-bold mb-2">
                No collections found
              </h3>
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? "Organize your favorite posts into collections."
                  : "This user hasn't created any public collections yet."}
              </p>
            </div>
          ) : (
            collections.map(
              (collection) =>
                (!collection.isPrivate || isOwnProfile) && (
                  <div
                    key={collection._id}
                    className="border-2 border-brutal p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-head text-2xl font-bold flex items-center gap-3">
                          {collection.title}
                          {collection.isPrivate && (
                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded border border-brutal">
                              Private
                            </span>
                          )}
                        </h3>
                        {collection.description && (
                          <p className="text-muted-foreground mt-1">
                            {collection.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                        {collection.postCount || 0} Items
                      </div>
                    </div>

                    {collection.posts && collection.posts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Deduplicate posts to prevent key errors from legacy bad data */}
                        {Array.from(
                          new Map(
                            collection.posts.map((p: any) => [p._id, p]),
                          ).values(),
                        ).map((post: any) => (
                          <PostCard
                            key={post._id}
                            post={{ ...post, isBookmarked: true }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/10 rounded-lg p-8 text-center border border-dashed border-brutal/50">
                        <p className="text-sm text-muted-foreground italic">
                          No posts in this collection yet.
                        </p>
                      </div>
                    )}
                  </div>
                ),
            )
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
