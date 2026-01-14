import { Skeleton } from "@/components/ui/Skeleton"
import { Navigation } from "@/components/layout/Navigation"

export default function Loading() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Banner Skeleton */}
        <div className="h-48 md:h-64 bg-muted/30 animate-pulse relative border-b-2 border-black"></div>
        
        <div className="container mx-auto px-4 pb-12">
           <div className="relative -mt-20 mb-8 flex flex-col md:flex-row items-end md:items-end gap-6">
              <Skeleton className="w-32 h-32 rounded-full border-4 border-black bg-background" />
              <div className="mb-4 flex-1">
                 <Skeleton className="h-8 w-48 mb-2" />
                 <Skeleton className="h-4 w-64" />
              </div>
              <div className="mb-4 flex gap-3">
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-24" />
              </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                 <div className="border-2 border-black p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                 </div>
              </div>
              
              <div className="lg:col-span-2">
                 <div className="border-b-2 border-black mb-6 pb-2">
                    <Skeleton className="h-8 w-32" />
                 </div>
                 <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
              </div>
           </div>
        </div>
      </main>
    </>
  )
}
