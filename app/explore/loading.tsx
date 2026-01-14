import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="w-full md:w-auto">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="w-full md:w-auto flex gap-2">
           <Skeleton className="h-10 w-full md:w-64" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-2 border-black p-0 h-[400px] flex flex-col">
            <Skeleton className="w-full h-48" />
            <div className="p-6 flex-1 flex flex-col">
               <div className="flex gap-2 mb-3">
                 <Skeleton className="h-5 w-16" />
                 <Skeleton className="h-5 w-16" />
               </div>
               <Skeleton className="h-8 w-3/4 mb-2" />
               <Skeleton className="h-4 w-full mb-1" />
               <Skeleton className="h-4 w-5/6" />
               <div className="mt-auto pt-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
