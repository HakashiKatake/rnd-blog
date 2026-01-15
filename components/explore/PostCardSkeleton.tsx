import { Skeleton } from "@/components/ui/skeleton"

export function PostCardSkeleton() {
    return (
        <div className="border-2 border-muted bg-card flex flex-col h-full rounded-none">
            {/* Thumbnail */}
            <div className="aspect-video w-full border-b-2 border-muted bg-muted/20 relative overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4" />

                {/* Excerpt */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />

                <div className="mt-auto pt-4 flex items-center justify-between">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    </div>

                    {/* Stats */}
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </div>
    )
}
