import { client, queries } from "@/lib/sanity/client";
import { Navigation } from "@/components/layout/Navigation";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";
import { Calendar, Search, Filter } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export const revalidate = 60; // Revalidate every minute

type EventListItem = {
    _id: string;
    title: string;
    slug: { current: string };
    description: string;
    eventType: string;
    locationType: string;
    location?: string;
    startTime: string;
    endTime?: string;
    registrationLink?: string;
    image?: unknown;
    organizer?: {
        name: string;
        avatar?: unknown;
    };
    registrationCount?: number;
};

export default async function EventsPage() {
    const { userId } = await auth();
    let registeredEventIds: string[] = [];

    if (userId) {
        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`;
        const sanityUserId = await client.withConfig({ useCdn: false }).fetch(userQuery);
        if (sanityUserId) {
            const registrations = await client.withConfig({ useCdn: false }).fetch<{ eventId: string }[]>(
                `*[_type == "eventRegistration" && user._ref == $sanityUserId]{ "eventId": event._ref }`,
                { sanityUserId }
            );
            registeredEventIds = registrations.map((r) => r.eventId);
        }
    }

    const [events, pastEvents] = await Promise.all([
        client.withConfig({ useCdn: false }).fetch<EventListItem[]>(queries.getUpcomingEvents),
        client.withConfig({ useCdn: false }).fetch<EventListItem[]>(queries.getPastEvents),
    ]);

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background">
                {/* Header Section */}
                <section className="relative overflow-hidden border-b-4 border-black bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.12),transparent_35%),linear-gradient(180deg,rgba(255,107,53,0.06),transparent)] py-14 sm:py-20">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl">
                            <div className="mb-4 inline-flex items-center rounded-full border-2 border-brutal bg-card px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] shadow-brutal-sm">
                                Live sessions, workshops, and club drops
                            </div>
                            <h1 className="font-head text-4xl md:text-7xl font-bold mb-5 relative inline-block leading-[0.98]">
                                Events & <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                                    Workshops
                                </span>
                            </h1>
                            <p className="max-w-2xl text-base text-muted-foreground mb-8 font-medium sm:text-xl">
                                Join exclusive workshops, collaborate on projects, and learn from industry experts.
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4 sm:flex-wrap">
                                <Link href="#events-grid">
                                    <Button className="h-14 w-full font-bold border-2 border-black bg-primary text-primary-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all text-base sm:text-lg px-5 sm:px-8">
                                        Explore Calendar
                                    </Button>
                                </Link>
                                <Link href="/events/propose">
                                    <Button variant="outline" className="h-14 w-full font-bold border-2 border-black bg-card text-card-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all text-base sm:text-lg px-5 sm:px-8">
                                        Host an Event
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Background Decorations */}
                    <div className="absolute top-20 right-20 opacity-10 rotate-12 md:block hidden">
                        <Calendar size={300} strokeWidth={1} />
                    </div>
                </section>

                {/* Events Grid */}
                <section id="events-grid" className="container mx-auto px-4 py-12 sm:py-16">
                    <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <h2 className="font-head text-3xl font-bold flex items-center gap-3">
                            Upcoming Sessions <div className="h-1 w-20 bg-primary/50 rounded-full mt-2 ml-4"></div>
                        </h2>

                        <div className="flex gap-3">
                            <div className="relative min-w-0 flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="h-12 w-full min-w-0 rounded-2xl border-2 border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary sm:w-64"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 border-border bg-card">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event) => (
                                <div key={event._id} className="h-full">
                                    <EventCard event={event} hasRegistered={registeredEventIds.includes(event._id)} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-3xl flex flex-col items-center">
                            <div className="inline-flex justify-center items-center h-20 w-20 rounded-full bg-muted mb-6">
                                <Calendar className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="font-head text-2xl font-bold mb-2">No upcoming events</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                We&apos;re currently planning the next big thing! Check back soon or propose your own event.
                            </p>
                            <Link href="/events/propose">
                                <Button className="font-bold border-2 border-black bg-primary text-primary-foreground">
                                    Propose an Event
                                </Button>
                            </Link>
                        </div>
                    )}
                </section>

                {/* Past Events Grid */}
                {pastEvents.length > 0 && (
                    <section className="container mx-auto px-4 pb-16">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-head text-3xl font-bold flex items-center gap-3">
                                Past Events <div className="h-1 w-20 bg-muted-foreground/50 rounded-full mt-2 ml-4"></div>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
                            {pastEvents.map((event) => (
                                <div key={event._id} className="h-full grayscale hover:grayscale-0 transition-all duration-300">
                                    <EventCard event={event} hasRegistered={registeredEventIds.includes(event._id)} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}


            </main>
        </>
    );
}
