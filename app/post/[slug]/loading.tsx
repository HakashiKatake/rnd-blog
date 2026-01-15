import { Navigation } from '@/components/layout/Navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background">
                <article className="container mx-auto px-4 py-12 max-w-4xl">
                    {/* Header Skeleton */}
                    <header className="mb-8 space-y-4">
                        {/* Tags */}
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>

                        {/* Title */}
                        <Skeleton className="h-12 w-full lg:w-3/4 rounded-md" />
                        <Skeleton className="h-12 w-1/2 lg:w-1/3 rounded-md" />

                        {/* Author & Meta */}
                        <div className="flex items-center justify-between border-y-2 border-muted py-4 mt-6">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>

                        {/* Featured Image */}
                        <div className="my-8 aspect-video w-full rounded-md overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </div>

                        {/* Excerpt */}
                        <div className="pl-4 border-l-4 border-muted">
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-5 w-5/6" />
                        </div>
                    </header>

                    {/* Content Skeleton */}
                    <div className="space-y-4 mb-12">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-32 w-full rounded-md mt-6" /> {/* Code block */}
                        <Skeleton className="h-4 w-full mt-6" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Engagement Actions Skeleton */}
                    <div className="border-y-2 border-muted py-6 mb-8 flex gap-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    {/* Author Bio Skeleton */}
                    <div className="border border-muted p-6 bg-card mb-8">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                    </div>


                </article>
            </main>
        </>
    )
}
