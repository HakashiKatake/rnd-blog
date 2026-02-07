import { client, queries, getImageUrl } from '@/lib/sanity/client'
import { auth } from '@clerk/nextjs/server'
import { Navigation } from '@/components/layout/Navigation'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'
import { Card } from '@/components/retroui/Card'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { FaArrowLeft, FaTrophy, FaClock, FaUsers, FaMapMarkerAlt, FaBolt, FaCheckCircle, FaBook, FaArrowRight, FaGithub, FaExternalLinkAlt, FaCircle } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'

export default async function QuestWorkspace({ params }: { params: { slug: string } }) {
    const { userId } = await auth()
    const { slug } = await params

    if (!userId) {
        redirect('/sign-in')
    }

    // 1. Fetch Quest Data & Participation in one go
    // Note: We fetch check if current user is a participant client-side or server-side?
    // The query 'getQuestBySlug' already returns ALL participants. 
    // We can filter locally or update query. For now, we fetch all (as per plan).
    const quest = await client.fetch(queries.getQuestBySlug(slug))

    if (!quest) {
        notFound()
    }

    // 2. Check Participation State & Author Rule
    const userParticipant = quest.participants?.find((p: any) => p.user?.clerkId === userId)
    let isJoined = !!userParticipant

    // AUTHOR RULE: If current user is author but not in participants list, add them now (Lazy Join)
    // This satisfies the "Consistency" requirement without complex Studio hooks.
    const isAuthor = quest.proposedBy?.clerkId === userId

    if (isAuthor && !isJoined) {
        try {
            // We perform a server-side mutation to add the author
            // This is safe because we are in a Server Component
            const participantId = `questParticipant-${quest._id}-${quest.participants?.find((p: any) => p.user?.clerkId === userId)?._id || 'author'}`
            // Wait, we need the Sanity User ID, not Clerk ID for the ID.
            // We can fetch it or just rely on the query having returned it if we projected it?
            // We didn't project the user's *own* Sanity ID in the quest query.
            // Let's do a robust check:
            const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`
            const sanityUserId = await client.fetch(userQuery)

            if (sanityUserId) {
                const pId = `questParticipant-${quest._id}-${sanityUserId}`
                await client.createIfNotExists({
                    _id: pId,
                    _type: 'questParticipant',
                    quest: { _type: 'reference', _ref: quest._id },
                    user: { _type: 'reference', _ref: sanityUserId },
                    status: 'active',
                    joinedAt: new Date().toISOString()
                })
                isJoined = true // Optimistically update for this render
            }
        } catch (err) {
            console.error('Failed to auto-join author:', err)
        }
    }

    // 3. Helpers
    const statusColors: Record<string, string> = {
        open: 'bg-primary text-primary-foreground',
        active: 'bg-secondary text-secondary-foreground',
    }
    const difficultyColors: Record<string, string> = {
        easy: 'bg-success text-white',
        medium: 'bg-accent text-accent-foreground',
        hard: 'bg-destructive text-white',
    }
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            {/* ZONE 1: QUEST CONTEXT HEADER (Section, Not Card) */}
            <section className="w-full border-b-2 border-black bg-background py-12">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Back Link */}
                    <Link href="/quests" className="inline-flex items-center gap-2 text-muted-foreground hover:text-black mb-6 text-sm font-medium transition-colors">
                        <FaArrowLeft /> Back to Quests
                    </Link>

                    {/* Badge Row */}
                    <div className="flex gap-3 mb-4">
                        <Badge className={statusColors[quest.status] || 'bg-gray-500 text-white'}>
                            {quest.status?.toUpperCase()}
                        </Badge>
                        <Badge className={difficultyColors[quest.difficulty] || 'bg-gray-500 text-white'}>
                            {quest.difficulty?.toUpperCase()}
                        </Badge>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-head font-bold text-black mb-6 leading-tight">
                        {quest.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                            <FaTrophy className="text-primary" />
                            <span className="text-foreground">Reward:</span>
                            <span className="font-bold text-primary">+{quest.rewardPoints} XP</span>
                        </div>
                        {quest.daysRemaining && (
                            <div className="flex items-center gap-2">
                                <FaClock />
                                <span className="text-foreground">Time Remaining:</span>
                                <span className="font-bold">{quest.daysRemaining} days</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <FaUsers />
                            <span className="text-foreground">Participants:</span>
                            <span className="font-bold">{quest.participants?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ZONE 2: WORKSPACE BODY */}
            <div className="max-w-7xl mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-10">

                {/* LEFT COLUMN: The "Work" Stream */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Brief */}
                    <section>
                        <h2 className="text-2xl font-head font-bold mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-primary" /> Mission Brief
                        </h2>
                        <Card className="border-brutal p-8 bg-card shadow-brutal">
                            <div className="prose-brutal text-lg leading-relaxed">
                                {quest.description ? (
                                    <ReactMarkdown>{quest.description}</ReactMarkdown>
                                ) : (
                                    <p className="italic text-muted-foreground">No description provided.</p>
                                )}
                            </div>
                        </Card>
                    </section>

                    {/* Timeline */}
                    <section>
                        <h2 className="text-2xl font-head font-bold mb-6">Progress Timeline</h2>
                        <div className="pl-4 border-l-2 border-dashed border-gray-300 space-y-8 relative">
                            {/* Start Node */}
                            <div className="relative pl-8">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-success border-2 border-white ring-2 ring-success"></div>
                                <h3 className="font-bold text-lg">Mission Started</h3>
                                <p className="text-muted-foreground text-sm">
                                    {isJoined
                                        ? `You joined on ${formatDate(userParticipant?.joinedAt || new Date().toISOString())}`
                                        : "You haven't joined this quest yet."}
                                </p>
                            </div>

                            {/* Pending State */}
                            <div className="relative pl-8 py-4 opacity-50">
                                <div className="absolute -left-[5px] top-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
                                <p className="text-sm font-mono text-muted-foreground">IN PROGRESS...</p>
                            </div>

                            {/* End Node */}
                            <div className="relative pl-8 opacity-60">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-transparent border-2 border-gray-400"></div>
                                <h3 className="font-bold text-lg text-muted-foreground">Mission Complete</h3>
                                <p className="text-muted-foreground text-sm">Submit your project to claim {quest.rewardPoints} XP.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Sidebar */}
                <div className="space-y-8">

                    {/* Group 1: Participation + Team */}
                    <Card className="border-brutal shadow-brutal bg-card overflow-hidden">
                        <div className="p-6 border-b-2 border-black bg-muted/20">
                            <h3 className="font-head font-bold text-lg flex items-center gap-2">
                                <FaBolt className="text-primary" /> Your Status
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">Current State</span>
                                {isJoined ? (
                                    <Badge className="bg-success text-white flex items-center gap-1">
                                        <FaCheckCircle /> Active Agent
                                    </Badge>
                                ) : (
                                    <Badge className="bg-gray-200 text-gray-600">Observer</Badge>
                                )}
                            </div>

                            {/* Team */}
                            <div>
                                <h4 className="font-bold text-sm mb-3 flex items-center justify-between">
                                    Squad ({quest.participants?.length || 0})
                                </h4>
                                <div className="flex flex-col gap-3">
                                    {quest.participants?.slice(0, 5).map((p: any, i: number) => (
                                        <div key={p._id || i} className="flex items-center gap-3">
                                            {p.user?.avatar ? (
                                                <Image
                                                    src={getImageUrl(p.user.avatar)!}
                                                    alt={p.user.name}
                                                    width={32} height={32}
                                                    className="rounded-full border border-black bg-white"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full border border-black bg-gray-100 flex items-center justify-center text-xs font-bold">
                                                    {p.user?.name?.[0] || '?'}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium truncate">{p.user?.name}</span>
                                            {p.user?.clerkId === quest.proposedBy?.clerkId && (
                                                <Badge className="text-[10px] py-0 h-5 bg-primary/10 text-primary border-primary/20">Lead</Badge>
                                            )}
                                        </div>
                                    ))}
                                    {(!quest.participants || quest.participants.length === 0) && (
                                        <p className="text-sm text-muted-foreground italic">No agents active yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Group 2: Resources & Author */}
                    <div className="space-y-4">
                        <Card className="border-brutal bg-card p-5 hover:bg-muted/10 transition-colors cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-accent/20 flex items-center justify-center border border-black group-hover:scale-105 transition-transform">
                                        <FaBook className="text-accent text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Knowledge Hub</h4>
                                        <p className="text-xs text-muted-foreground">Resources & Assets</p>
                                    </div>
                                </div>
                                <FaArrowRight className="text-muted-foreground group-hover:text-black -translate-x-2 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100" />
                            </div>
                        </Card>

                        <div className="px-2 pt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Proposed by</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{quest.proposedBy?.name}</span>
                                {quest.proposedBy?.avatar && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                                        <Image
                                            src={getImageUrl(quest.proposedBy.avatar)!}
                                            width={24} height={24} alt="Author"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
