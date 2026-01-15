import { Navigation } from '@/components/layout/Navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Header Skeleton */}
                    <div className="mb-8 space-y-3">
                        <Skeleton className="h-10 w-3/4 lg:w-1/2" />
                        <Skeleton className="h-6 w-full lg:w-1/3" />
                    </div>

                    {/* Form Skeleton */}
                    <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-32" />

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-24 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-64 w-full" />
                            </div>

                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
