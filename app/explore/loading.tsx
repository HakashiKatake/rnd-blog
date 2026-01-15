import { Navigation } from '@/components/layout/Navigation'
import { PostCardSkeleton } from '@/components/explore/PostCardSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background">
                {/* Header Skeleton */}
                <section className="border-b-4 border-black bg-primary/10 py-12">
                    <div className="container mx-auto px-4 space-y-4">
                        <Skeleton className="h-12 w-64 lg:w-96 rounded-md bg-black/10" />
                        <Skeleton className="h-6 w-full max-w-2xl rounded-md bg-black/5" />
                        <Skeleton className="h-6 w-3/4 max-w-xl rounded-md bg-black/5" />
                    </div>
                </section>

                {/* Filter Bar Skeleton */}
                <div className="border-b-2 border-black bg-background py-4 sticky top-0 z-10">
                    <div className="container mx-auto px-4 flex gap-4 overflow-hidden">

                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
                        ))}
                    </div>
                </div>

                {/* Posts Grid Skeleton */}
                <section className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <PostCardSkeleton key={i} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    )
}
