import { Navigation } from "@/components/layout/Navigation";
import { Hero } from "@/components/landing/Hero";
import { BentoGrid, BentoCard } from "@/components/landing/BentoGrid";
import {
  AnnouncementStrip,
  type AnnouncementItem,
} from "@/components/landing/AnnouncementStrip";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth/user";
import { client as sanityClient } from "@/sanity/lib/client";
import {
  FileText,
  Rocket,
  Trophy,
  Briefcase,
  Users,
  Layers,
  Lightbulb,
  Globe,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    await getOrCreateUser();
  }

  const homePageData = await sanityClient.fetch<{
    announcementStripEnabled?: boolean;
    announcements?: AnnouncementItem[];
    approvedPosts: number;
    activeQuests: number;
    approvedEvents: number;
  }>(
    `{
      "announcementStripEnabled": *[_type == "homeSettings"] | order(_updatedAt desc)[0].announcementStripEnabled,
      "announcements": *[_type == "homeSettings"] | order(_updatedAt desc)[0].announcements[
        enabled == true &&
        (!defined(startAt) || dateTime(startAt) <= now()) &&
        (!defined(endAt) || dateTime(endAt) >= now())
      ]{
        _key,
        enabled,
        eyebrow,
        text,
        ctaLabel,
        href,
        startAt,
        endAt
      },
      "approvedPosts": count(*[_type == "post" && status == "approved"]),
      "activeQuests": count(*[_type == "quest" && status in ["open", "active"]]),
      "approvedEvents": count(*[_type == "event" && status == "approved"])
    }`,
  );

  const features = [
    {
      Icon: FileText,
      name: "Peer-Curated Research",
      description:
        "Three-tier moderation system ensuring top-tier quality. Automated vetting, club review, and community voting.",
      href: "/explore",
      cta: "Read Research",
      className: "md:col-span-2",
      background: (
        <div className="absolute right-0 top-0 h-[300px] w-[600px] opacity-10 [mask-image:linear-gradient(to_bottom,white,transparent)] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />
      ),
    },
    {
      Icon: Rocket,
      name: "Quest System",
      description:
        "Turn 'What If' ideas into collaborative projects. Build with peers.",
      href: "/quests",
      cta: "Start a Quest",
      className: "md:col-span-1",
      background: (
        <div className="absolute right-0 top-0 h-[200px] w-[200px] opacity-10 bg-gradient-to-tr from-orange-400 to-red-500 blur-3xl rounded-full" />
      ),
    },
    {
      Icon: Trophy,
      name: "Gamification",
      description: "Earn points, unlock badges, and climb the leaderboard.",
      href: "/leaderboard",
      cta: "View Leaderboard",
      className: "md:col-span-1",
      background: (
        <div className="absolute -right-10 -top-10 h-[300px] w-[300px] opacity-5 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      ),
    },
    {
      Icon: Briefcase,
      name: "Portfolio Export",
      description:
        "One-click PDF with your top projects and verified badges. Perfect for job applications.",
      href: "/profile",
      cta: "Build Portfolio",
      className: "md:col-span-2",
      background: (
        <div className="absolute right-0 bottom-0 h-[300px] w-[600px] opacity-5 [mask-image:linear-gradient(to_top,white,transparent)] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />
      ),
    },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground">
        {homePageData.announcementStripEnabled &&
        (homePageData.announcements || []).length > 0 ? (
          <AnnouncementStrip announcements={homePageData.announcements || []} />
        ) : null}

        <Hero
          stats={{
            approvedPosts: homePageData.approvedPosts,
            activeQuests: homePageData.activeQuests,
            approvedEvents: homePageData.approvedEvents,
          }}
          convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)}
        />

        {/* Features Grid - Bento Style */}
        <section className="container mx-auto px-4 py-14 sm:py-20">
          <div className="mb-8 text-left sm:mb-16 sm:text-center">
            <div className="mb-4 inline-flex items-center rounded-full border-2 border-brutal bg-card px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] shadow-brutal-sm">
              Built to hook curious engineers
            </div>
            <h2 className="font-head text-3xl font-bold mb-4 sm:text-4xl lg:text-6xl">
              Why{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                SPARK
              </span>
              ?
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground sm:mx-auto sm:text-xl">
              Publish sharp engineering stories, discover real opportunities,
              and grow a portfolio people actually want to read.
            </p>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto mb-16 px-4 py-6 sm:py-16">
          <div className="relative overflow-hidden rounded-3xl border-2 border-brutal bg-card p-6 text-card-foreground shadow-brutal sm:p-10 md:p-16">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-primary/10 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10 mb-8 text-left sm:mb-16 sm:text-center">
              <h2 className="font-head text-3xl font-bold mb-4 md:text-5xl">
                Join the Movement
              </h2>
              <p className="text-base text-muted-foreground sm:text-lg">
                Students, builders, and club projects growing together.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-6 text-left sm:gap-8 md:grid-cols-3 md:gap-12 md:text-center md:divide-x md:divide-y-0 divide-border">
              <div className="rounded-2xl border-2 border-brutal bg-background/80 p-5 shadow-brutal-sm md:border-0 md:bg-transparent md:p-0 md:shadow-none">
                <div className="mb-4 flex justify-start text-orange-500 md:justify-center">
                  <Users size={32} />
                </div>
                <div className="mb-2 font-head text-4xl font-bold sm:text-5xl md:text-6xl">
                  500+
                </div>
                <p className="text-muted-foreground">Engineering Students</p>
              </div>
              <div className="rounded-2xl border-2 border-brutal bg-background/80 p-5 shadow-brutal-sm md:border-0 md:bg-transparent md:p-0 md:pl-8 md:shadow-none">
                <div className="mb-4 flex justify-start text-blue-500 md:justify-center">
                  <Layers size={32} />
                </div>
                <div className="mb-2 font-head text-4xl font-bold sm:text-5xl md:text-6xl">
                  200+
                </div>
                <p className="text-muted-foreground">Research Posts</p>
              </div>
              <div className="rounded-2xl border-2 border-brutal bg-background/80 p-5 shadow-brutal-sm md:border-0 md:bg-transparent md:p-0 md:pl-8 md:shadow-none">
                <div className="mb-4 flex justify-start text-green-500 md:justify-center">
                  <Lightbulb size={32} />
                </div>
                <div className="mb-2 font-head text-4xl font-bold sm:text-5xl md:text-6xl">
                  50+
                </div>
                <p className="text-muted-foreground">Collaborative Quests</p>
              </div>
            </div>
          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-border bg-card py-12">
          <div className="container mx-auto flex flex-col gap-6 px-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex items-center justify-center gap-2 font-head text-xl font-bold md:justify-start">
              <Globe className="h-5 w-5" /> SPARK
            </div>
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} ITM RnD Club. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-neutral-600 md:justify-end">
              <a href="#" className="hover:text-black transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
