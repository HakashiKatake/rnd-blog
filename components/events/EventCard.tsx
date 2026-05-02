import Link from 'next/link'
import { Calendar, MapPin, Clock, User } from 'lucide-react'
import { Button } from '@/components/retroui/Button'
import { getImageUrl } from '@/lib/sanity/client'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"

import { RegisterButton } from './RegisterButton'

interface EventProps {
    event: {
        _id: string
        title: string
        slug: { current: string }
        description: string
        eventType: string
        locationType: string
        location?: string
        startTime: string
        endTime?: string
        registrationLink?: string
        image?: unknown
        organizer?: {
            name: string
            avatar?: unknown
        }
        registrationCount?: number
    }
    hasRegistered?: boolean
}

export function EventCard({ event, hasRegistered = false }: EventProps) {
    const startDate = new Date(event.startTime)
    const endDate = event.endTime ? new Date(event.endTime) : new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour

    const formatGoogleCalendarDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "")
    }

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}`

    return (
        <div className="bg-card text-card-foreground border-2 border-border shadow-brutal hover:shadow-brutal-sm transition-all rounded-[1.5rem] overflow-hidden flex flex-col h-full group">
            {/* Image Section */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="h-64 sm:h-80 md:h-96 bg-zinc-100 dark:bg-zinc-950 relative overflow-hidden border-b-2 border-border flex items-center justify-center cursor-pointer group/image">
                        {event.image ? (
                            <img
                                src={getImageUrl(event.image) || ""}
                                alt={event.title}
                                className="w-full h-full object-contain transition-transform duration-500 group-hover/image:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                                <Calendar className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-background border-2 border-black px-3 py-1 font-bold text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase tracking-wider">
                            {event.eventType}
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <Button className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors font-bold shadow-none">
                                View Details
                            </Button>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] !max-w-[95vw] sm:!max-w-[90vw] md:!max-w-4xl lg:!max-w-5xl xl:!max-w-6xl p-0 overflow-hidden border-2 sm:border-4 border-foreground rounded-2xl sm:rounded-3xl shadow-brutal bg-card">
                    <DialogTitle className="sr-only">{event.title}</DialogTitle>
                    <DialogDescription className="sr-only">Details for {event.title}</DialogDescription>
                    
                    <div className="flex flex-col md:flex-row w-full max-h-[90vh] md:max-h-[85vh]">
                        {/* Poster Section */}
                        <div className="w-full md:w-[45%] bg-zinc-100 dark:bg-zinc-950 border-b-2 md:border-b-0 md:border-r-2 border-border relative flex-shrink-0 flex items-center justify-center p-6 sm:p-8">
                            {event.image ? (
                                <img
                                    src={getImageUrl(event.image) || ""}
                                    alt={event.title}
                                    className="w-full h-auto max-h-[35vh] md:max-h-[80vh] object-contain drop-shadow-xl"
                                />
                            ) : (
                                <div className="h-[200px] md:h-full flex items-center justify-center">
                                    <Calendar className="h-24 w-24 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="w-full md:w-[55%] p-6 sm:p-8 lg:p-12 flex flex-col bg-background overflow-y-auto">
                            <div className="mb-6 flex flex-wrap gap-3">
                                <span className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-foreground rounded-full bg-primary text-primary-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                    {event.eventType}
                                </span>
                            </div>
                            
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-head font-black mb-8 leading-tight text-foreground">
                                {event.title}
                            </h2>
                            
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                                {/* Date & Time */}
                                <div className="flex flex-col gap-1 p-5 border-2 border-border rounded-xl bg-card hover:shadow-brutal-sm transition-all">
                                    <div className="flex items-center gap-2 font-bold text-lg mb-2 text-foreground">
                                        <Clock className="w-5 h-5 text-orange-500" /> Date & Time
                                    </div>
                                    <p className="font-semibold text-base text-foreground">{startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {/* Location */}
                                <div className="flex flex-col gap-1 p-5 border-2 border-border rounded-xl bg-card hover:shadow-brutal-sm transition-all">
                                    <div className="flex items-center gap-2 font-bold text-lg mb-2 text-foreground">
                                        <MapPin className="w-5 h-5 text-blue-500" /> Location
                                    </div>
                                    <p className="font-semibold text-base text-foreground line-clamp-2">{event.locationType === 'virtual' ? 'Virtual Event' : event.location || 'TBA'}</p>
                                </div>
                            </div>

                            {event.organizer && (
                                <div className="flex items-center gap-4 mb-10 p-5 border-2 border-border rounded-xl bg-card">
                                    <div className="h-14 w-14 rounded-full border-2 border-foreground overflow-hidden bg-muted flex-shrink-0">
                                        {event.organizer.avatar ? (
                                            <img src={getImageUrl(event.organizer.avatar) || ""} alt={event.organizer.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-full h-full p-3 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Organized By</p>
                                        <p className="font-black text-xl text-foreground">{event.organizer.name}</p>
                                    </div>
                                </div>
                            )}

                            {event.description && (
                                <div className="mb-10 flex-1">
                                    <h3 className="text-xl font-bold mb-4 text-foreground border-b-2 border-border pb-2 inline-block">
                                        About this event
                                    </h3>
                                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-6 border-t-2 border-border bg-background">
                                {event.registrationLink ? (
                                    <Link href={event.registrationLink} target="_blank" className="block w-full">
                                        <Button className="w-full text-lg py-7 bg-primary text-primary-foreground border-2 border-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all font-bold">
                                            Register Now
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className="[&>button]:w-full [&>button]:py-7 [&>button]:text-lg">
                                        <RegisterButton
                                            eventSlug={event.slug.current}
                                            isPast={new Date(event.startTime) < new Date()}
                                            hasRegistered={hasRegistered}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Content Section */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                    <Clock className="h-4 w-4" />
                    {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                <h3 className="font-head text-xl sm:text-2xl font-bold mb-3 line-clamp-2 min-h-[3.2rem] sm:min-h-[4rem]">
                    {event.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.locationType === 'virtual' ? 'Virtual Event' : event.location || 'TBA'}</span>
                </div>

                {event.organizer && (
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden border border-black">
                            {getImageUrl(event.organizer.avatar) ? (
                                <img src={getImageUrl(event.organizer.avatar) || ""} alt={event.organizer.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-4 w-4 m-1 text-gray-500" />
                            )}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">By {event.organizer.name}</span>
                    </div>
                )}


                <div className="mt-auto flex gap-3 flex-wrap">
                    <div className="flex-1">
                        {event.registrationLink ? (
                            <Link href={event.registrationLink} target="_blank" className="block w-full">
                                <Button className="w-full bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all font-bold">
                                    Register Now (External)
                                </Button>
                            </Link>
                        ) : (
                            <RegisterButton
                                eventSlug={event.slug.current}
                                isPast={new Date(event.startTime) < new Date()}
                                hasRegistered={hasRegistered}
                            />
                        )}
                    </div>

                    <Link href={googleCalendarUrl} target="_blank">
                        <Button variant="outline" className="px-3 border-2 border-foreground bg-card hover:bg-muted shadow-brutal transition-all" title="Add to Google Calendar">
                            <Calendar className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
