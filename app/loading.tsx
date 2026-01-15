import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "@/components/layout/Navigation";

export default function Loading() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background">
                {/* Hero Section Skeleton */}
                <section className="container mx-auto px-4 py-16 lg:py-24">
                    <div className="flex flex-col items-center max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-8 w-64 rounded-full" />
                        <Skeleton className="h-24 w-full lg:w-3/4 rounded-lg" />
                        <Skeleton className="h-24 w-full lg:w-3/4 rounded-lg lg:hidden" />
                        <Skeleton className="h-6 w-full max-w-2xl rounded-md" />
                        <Skeleton className="h-6 w-3/4 max-w-xl rounded-md" />

                        <div className="flex gap-4 mt-8">
                            <Skeleton className="h-12 w-40 rounded-md" />
                            <Skeleton className="h-12 w-40 rounded-md" />
                        </div>
                    </div>
                </section>

                {/* Features Grid Skeleton */}
                <section className="container mx-auto px-4 py-16">
                    <div className="flex justify-center mb-12">
                        <Skeleton className="h-12 w-64 rounded-md" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 - Large Card */}
                        <div className="md:col-span-2 border-2 border-muted bg-card p-8 rounded-none">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-12 w-12 rounded-md" />
                                <div className="space-y-3 w-full">
                                    <Skeleton className="h-8 w-48 rounded-md" />
                                    <Skeleton className="h-4 w-full rounded-md" />
                                    <Skeleton className="h-4 w-3/4 rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 & 3 */}
                        {[1, 2].map((i) => (
                            <div key={i} className="border-2 border-muted bg-card p-8 rounded-none">
                                <Skeleton className="h-10 w-10 rounded-md mb-4" />
                                <Skeleton className="h-8 w-32 rounded-md mb-3" />
                                <Skeleton className="h-4 w-full rounded-md" />
                                <Skeleton className="h-4 w-5/6 rounded-md mt-2" />
                            </div>
                        ))}

                        {/* Feature 4 - Wide Card */}
                        <div className="md:col-span-2 border-2 border-muted bg-card p-8 rounded-none">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-12 w-12 rounded-md" />
                                <div className="space-y-3 w-full">
                                    <Skeleton className="h-8 w-48 rounded-md" />
                                    <Skeleton className="h-4 w-full rounded-md" />
                                    <Skeleton className="h-4 w-3/4 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
