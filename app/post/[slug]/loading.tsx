import { Skeleton } from "@/components/ui/Skeleton"
import { Navigation } from "@/components/layout/Navigation"

export default function Loading() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
               <Skeleton className="h-6 w-20" />
               <Skeleton className="h-6 w-24" />
            </div>
            
            <Skeleton className="h-12 w-3/4 mb-6" />

            {/* Author */}
            <div className="flex items-center justify-between border-y-2 border-black py-4">
              <div className="flex items-center gap-3">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                 </div>
              </div>
              <div className="flex gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
              </div>
            </div>
            
            <Skeleton className="mt-8 w-full h-[450px]" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4 max-w-none mb-12">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="my-8">
               <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </article>
      </main>
    </>
  )
}
