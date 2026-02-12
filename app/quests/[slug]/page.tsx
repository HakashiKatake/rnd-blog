import { client, queries, getImageUrl } from "@/lib/sanity/client";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/retroui/Badge";
import { Card } from "@/components/retroui/Card";
import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaTrophy,
  FaClock,
  FaUsers,
  FaMapMarkerAlt,
  FaBolt,
  FaCheckCircle,
  FaBook,
  FaExternalLinkAlt,
  FaCircle,
  FaFlagCheckered,
  FaStar,
  FaCalendarAlt,
  FaShieldAlt,
  FaUserAstronaut,
  FaSpinner,
  FaHourglassHalf,
  FaLink,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default async function QuestWorkspace({
  params,
}: {
  params: { slug: string };
}) {
  const { userId } = await auth();
  const { slug } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const quest = await client.fetch(queries.getQuestBySlug(slug));

  if (!quest) {
    notFound();
  }

  // Check Participation State & Author Rule
  const userParticipant = quest.participants?.find(
    (p: any) => p.user?.clerkId === userId,
  );
  let isJoined = !!userParticipant;

  const isAuthor = quest.proposedBy?.clerkId === userId;

  if (isAuthor && !isJoined) {
    try {
      const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`;
      const sanityUserId = await client.fetch(userQuery);

      if (sanityUserId) {
        const pId = `questParticipant-${quest._id}-${sanityUserId}`;
        await client.createIfNotExists({
          _id: pId,
          _type: "questParticipant",
          quest: { _type: "reference", _ref: quest._id },
          user: { _type: "reference", _ref: sanityUserId },
          status: "active",
          joinedAt: new Date().toISOString(),
        });
        isJoined = true;
      }
    } catch (err) {
      console.error("Failed to auto-join author:", err);
    }
  }

  // Helpers
  const statusConfig: Record<
    string,
    { bg: string; icon: React.ReactNode; label: string }
  > = {
    open: {
      bg: "bg-emerald-500 text-white",
      icon: <FaCircle className="text-[8px]" />,
      label: "OPEN",
    },
    active: {
      bg: "bg-primary text-white",
      icon: <FaBolt className="text-[10px]" />,
      label: "ACTIVE",
    },
    completed: {
      bg: "bg-secondary text-white",
      icon: <FaCheckCircle className="text-[10px]" />,
      label: "COMPLETED",
    },
  };
  const difficultyConfig: Record<
    string,
    { bg: string; label: string; stars: number }
  > = {
    easy: { bg: "bg-success text-white", label: "EASY", stars: 1 },
    medium: { bg: "bg-accent text-white", label: "MEDIUM", stars: 2 },
    hard: { bg: "bg-destructive text-white", label: "HARD", stars: 3 },
  };
  const milestoneStatusConfig: Record<
    string,
    { color: string; icon: React.ReactNode; pulse: boolean }
  > = {
    completed: {
      color: "bg-success",
      icon: <FaCheckCircle className="text-white text-xs" />,
      pulse: false,
    },
    "in-progress": {
      color: "bg-primary",
      icon: <FaSpinner className="text-white text-xs animate-spin" />,
      pulse: true,
    },
    pending: {
      color: "bg-gray-300",
      icon: <FaHourglassHalf className="text-gray-500 text-xs" />,
      pulse: false,
    },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365)
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
  };

  const statusInfo = statusConfig[quest.status] || statusConfig.open;
  const difficultyInfo =
    difficultyConfig[quest.difficulty] || difficultyConfig.medium;
  const participantCount = quest.participants?.length || 0;
  const hasTimeline = quest.timeline && quest.timeline.length > 0;
  const hasResources = quest.resources && quest.resources.length > 0;

  const participantStatusDot: Record<string, string> = {
    active: "bg-success",
    completed: "bg-accent",
    dropped: "bg-destructive",
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      {/* ═══════════════════════════════════════ */}
      {/* ZONE 1: QUEST CONTEXT HEADER            */}
      {/* ═══════════════════════════════════════ */}
      <section className="w-full border-b-2 border-black bg-background relative overflow-hidden">
        {/* Subtle top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-success" />

        <div className="max-w-7xl mx-auto px-6 pt-14 pb-12">
          {/* Back Link */}
          <Link
            href="/quests"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-black mb-8 text-sm font-medium transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Quests
          </Link>

          {/* Badge Row */}
          <div className="flex flex-wrap gap-3 mb-5">
            <Badge className={`${statusInfo.bg} flex items-center gap-1.5`}>
              {statusInfo.icon} {statusInfo.label}
            </Badge>
            <Badge className={`${difficultyInfo.bg} flex items-center gap-1.5`}>
              {Array.from({ length: difficultyInfo.stars }).map((_, i) => (
                <FaStar key={i} className="text-[10px]" />
              ))}
              {difficultyInfo.label}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-head font-bold text-black mb-8 leading-tight tracking-tight">
            {quest.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm md:text-base">
            <div className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
              <FaTrophy className="text-primary" />
              <span className="text-muted-foreground">Reward</span>
              <span className="font-bold text-primary text-lg">
                +{quest.rewardPoints} XP
              </span>
            </div>
            {quest.daysRemaining != null && (
              <div
                className={`flex items-center gap-2.5 rounded-lg px-4 py-2 border ${
                  quest.daysRemaining <= 3
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-muted/50 border-black/10"
                }`}
              >
                <FaClock
                  className={
                    quest.daysRemaining <= 3
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                />
                <span className="text-muted-foreground">Deadline</span>
                <span
                  className={`font-bold ${quest.daysRemaining <= 3 ? "text-destructive" : ""}`}
                >
                  {quest.daysRemaining} day
                  {quest.daysRemaining !== 1 ? "s" : ""} left
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5 bg-muted/50 border border-black/10 rounded-lg px-4 py-2">
              <FaUsers className="text-muted-foreground" />
              <span className="text-muted-foreground">Participants</span>
              <span className="font-bold">{participantCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* ZONE 2: WORKSPACE BODY                  */}
      {/* ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid lg:grid-cols-3 gap-10">
        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-2 space-y-12">
          {/* ── Mission Brief ── */}
          <section>
            <h2 className="text-2xl font-head font-bold mb-5 flex items-center gap-2.5">
              <FaMapMarkerAlt className="text-primary" /> Mission Brief
            </h2>
            <Card className="border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-card overflow-hidden w-full block">
              <div className="flex">
                {/* Accent side stripe */}
                <div className="w-1.5 bg-gradient-to-b from-primary to-accent shrink-0" />
                <div className="p-8 flex-1 min-w-0">
                  <div className="prose-brutal text-base md:text-lg leading-relaxed">
                    {quest.description ? (
                      <ReactMarkdown>{quest.description}</ReactMarkdown>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground italic text-base">
                          No mission brief has been written yet.
                        </p>
                        <p className="text-muted-foreground text-sm mt-2">
                          The quest author can add a description from the Sanity
                          Studio.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* ── Progress Timeline ── */}
          <section>
            <h2 className="text-2xl font-head font-bold mb-8 flex items-center gap-2.5">
              <FaFlagCheckered className="text-primary" /> Progress Timeline
            </h2>

            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-success via-gray-200 to-gray-200" />

              <div className="space-y-0">
                {/* ── Start Node ── */}
                <div className="relative pb-8">
                  <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-success border-2 border-white ring-2 ring-success flex items-center justify-center shadow-sm">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                  <div className="ml-2">
                    <h3 className="font-bold text-lg text-foreground">
                      Mission Started
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {isJoined
                        ? `You joined ${getRelativeTime(userParticipant?.joinedAt || new Date().toISOString())} · ${formatDate(userParticipant?.joinedAt || new Date().toISOString())}`
                        : "You haven't joined this quest yet."}
                    </p>
                  </div>
                </div>

                {/* ── Dynamic Milestones ── */}
                {hasTimeline ? (
                  quest.timeline.map((milestone: any, index: number) => {
                    const msConfig =
                      milestoneStatusConfig[milestone.status] ||
                      milestoneStatusConfig.pending;
                    return (
                      <div
                        key={milestone._key || index}
                        className="relative pb-8"
                      >
                        {/* Node */}
                        <div
                          className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full ${msConfig.color} border-2 border-white ring-2 ${msConfig.pulse ? "ring-primary/40 animate-pulse" : `ring-${milestone.status === "completed" ? "success" : "gray-200"}`} flex items-center justify-center shadow-sm`}
                        >
                          {msConfig.icon}
                        </div>
                        <div className="ml-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3
                              className={`font-bold text-base ${milestone.status === "completed" ? "text-foreground" : milestone.status === "in-progress" ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {milestone.title}
                            </h3>
                            <span
                              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                                milestone.status === "completed"
                                  ? "bg-success/10 text-success border-success/20"
                                  : milestone.status === "in-progress"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-gray-100 text-muted-foreground border-gray-200"
                              }`}
                            >
                              {milestone.status === "in-progress"
                                ? "IN PROGRESS"
                                : milestone.status?.toUpperCase()}
                            </span>
                          </div>
                          {milestone.dueDate && (
                            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                              <FaCalendarAlt className="text-xs" />
                              Due {formatDate(milestone.dueDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* No milestones placeholder */
                  <div className="relative pb-8">
                    <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-gray-200 border-2 border-white ring-2 ring-gray-100 flex items-center justify-center">
                      <FaHourglassHalf className="text-gray-400 text-xs" />
                    </div>
                    <div className="ml-2 py-4">
                      <p className="text-sm font-mono text-muted-foreground tracking-wide">
                        IN PROGRESS . . .
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No milestones have been defined for this quest yet.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── End Node ── */}
                <div className="relative">
                  <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-transparent border-2 border-gray-300 flex items-center justify-center">
                    <FaTrophy className="text-gray-400 text-xs" />
                  </div>
                  <div className="ml-2">
                    <h3 className="font-bold text-lg text-muted-foreground">
                      Mission Complete
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Submit your project to claim{" "}
                      <span className="font-bold text-primary">
                        +{quest.rewardPoints} XP
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ─── RIGHT COLUMN: Sidebar ─── */}
        <div className="space-y-6">
          {/* ── Your Status Card ── */}
          <Card className="border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-card overflow-hidden w-full block">
            <div className="p-5 border-b-2 border-black bg-muted/20">
              <h3 className="font-head font-bold text-lg flex items-center gap-2">
                <FaBolt className="text-primary" /> Your Status
              </h3>
            </div>
            <div className="p-5 space-y-5">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-sm">
                  Current State
                </span>
                {isJoined ? (
                  <Badge className="bg-success text-white flex items-center gap-1.5 text-xs">
                    <FaCheckCircle className="text-[10px]" /> Active Agent
                  </Badge>
                ) : (
                  <Badge className="bg-gray-200 text-gray-600 text-xs">
                    Observer
                  </Badge>
                )}
              </div>

              {/* Joined time */}
              {isJoined && userParticipant?.joinedAt && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground text-sm">
                    Joined
                  </span>
                  <span className="text-sm font-medium">
                    {getRelativeTime(userParticipant.joinedAt)}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200" />

              {/* Squad */}
              <div>
                <h4 className="font-bold text-sm mb-3 flex items-center justify-between text-foreground">
                  <span>Squad</span>
                  <span className="text-muted-foreground font-normal text-xs bg-muted px-2 py-0.5 rounded-full">
                    {participantCount} member{participantCount !== 1 ? "s" : ""}
                  </span>
                </h4>
                <div className="flex flex-col gap-3">
                  {quest.participants?.slice(0, 5).map((p: any, i: number) => (
                    <div
                      key={p._id || i}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative">
                        {p.user?.avatar ? (
                          <Image
                            src={getImageUrl(p.user.avatar)!}
                            alt={p.user.name}
                            width={32}
                            height={32}
                            className="rounded-full border border-black bg-white"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-black bg-gray-100 flex items-center justify-center text-xs font-bold">
                            {p.user?.name?.[0] || "?"}
                          </div>
                        )}
                        {/* Status dot */}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${participantStatusDot[p.status] || "bg-gray-300"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {p.user?.name}
                        </span>
                      </div>
                      {p.user?.clerkId === quest.proposedBy?.clerkId && (
                        <Badge className="text-[10px] py-0 h-5 bg-primary/10 text-primary border border-primary/20">
                          Lead
                        </Badge>
                      )}
                    </div>
                  ))}
                  {participantCount > 5 && (
                    <p className="text-xs text-muted-foreground pl-11">
                      +{participantCount - 5} more member
                      {participantCount - 5 > 1 ? "s" : ""}
                    </p>
                  )}
                  {participantCount === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      No agents active yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Quest Details Card ── */}
          <Card className="border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-card overflow-hidden w-full block">
            <div className="p-5 border-b-2 border-black bg-muted/20">
              <h3 className="font-head font-bold text-lg flex items-center gap-2">
                <FaShieldAlt className="text-accent" /> Quest Details
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  className={`${statusInfo.bg} flex items-center gap-1 text-xs`}
                >
                  {statusInfo.icon} {statusInfo.label}
                </Badge>
              </div>
              {/* Difficulty */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Difficulty
                </span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-sm ${i < difficultyInfo.stars ? "text-primary" : "text-gray-200"}`}
                    />
                  ))}
                  <span className="text-xs font-bold ml-1">
                    {difficultyInfo.label}
                  </span>
                </div>
              </div>
              {/* Reward */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reward</span>
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <FaTrophy className="text-xs" /> +{quest.rewardPoints} XP
                </span>
              </div>
              {/* Deadline */}
              {quest.daysRemaining != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Deadline
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1.5 text-sm ${quest.daysRemaining <= 3 ? "text-destructive" : ""}`}
                  >
                    <FaClock className="text-xs" />
                    {quest.daysRemaining} day
                    {quest.daysRemaining !== 1 ? "s" : ""} left
                  </span>
                </div>
              )}
              {/* Participants */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Participants
                </span>
                <span className="font-bold flex items-center gap-1.5 text-sm">
                  <FaUsers className="text-xs text-muted-foreground" />{" "}
                  {participantCount}
                </span>
              </div>
            </div>
          </Card>

          {/* ── Resources Section ── */}
          <Card className="border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-card overflow-hidden w-full block">
            <div className="p-5 border-b-2 border-black bg-muted/20">
              <h3 className="font-head font-bold text-lg flex items-center gap-2">
                <FaBook className="text-accent" /> Resources
              </h3>
            </div>
            <div className="p-5">
              {hasResources ? (
                <div className="space-y-3">
                  {quest.resources.map((resource: any, i: number) => (
                    <a
                      key={resource._key || i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-black/10 bg-muted/5 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-md bg-accent/15 flex items-center justify-center border border-black/10 group-hover:bg-accent/25 transition-colors shrink-0">
                        <FaLink className="text-accent text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {resource.title || "Untitled Resource"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {resource.url}
                        </p>
                      </div>
                      <FaExternalLinkAlt className="text-muted-foreground text-xs group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaBook className="text-2xl text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground italic">
                    No resources added yet.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* ── Proposed By (Author Card) ── */}
          <Card className="border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-card overflow-hidden w-full block">
            <div className="p-5 flex items-center gap-4">
              {quest.proposedBy?.avatar ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black shrink-0 shadow-sm">
                  <Image
                    src={getImageUrl(quest.proposedBy.avatar)!}
                    width={48}
                    height={48}
                    alt="Author"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-black bg-primary/10 flex items-center justify-center shrink-0">
                  <FaUserAstronaut className="text-primary text-lg" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Quest Author
                </p>
                <p className="font-bold text-foreground truncate">
                  {quest.proposedBy?.name || "Unknown"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
