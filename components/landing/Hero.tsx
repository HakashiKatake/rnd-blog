import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { StatPill, VisitorCounter } from "./VisitorCounter";

type HeroProps = {
  stats: {
    approvedPosts: number;
    activeQuests: number;
    approvedEvents: number;
  };
  convexEnabled: boolean;
};

export function Hero({ stats, convexEnabled }: HeroProps) {
  return (
    <section className="relative overflow-hidden pb-20 pt-10 sm:pt-12 md:pt-16 lg:pb-28">
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-12">
          <div className="max-w-4xl text-left">
            <Badge className="mb-6 inline-flex items-center gap-2 bg-yellow-300 text-black border-2 border-brutal shadow-brutal px-4 py-2 text-[11px] sm:text-sm font-bold uppercase tracking-wider transform -rotate-2 hover:rotate-0 transition-transform">
            <Sparkles className="h-4 w-4" />
            Beta Launch • Join the Revolution
          </Badge>

            <h1 className="font-head text-4xl font-black leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-7xl lg:text-[5.25rem]">
              Ignite Ideas.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 relative inline-block px-1 pb-2">
                Build Together.
                <svg
                  className="absolute -bottom-2 left-0 h-4 w-full text-foreground opacity-20"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:text-xl">
              The{" "}
              <span className="font-bold underline decoration-wavy decoration-orange-400 text-foreground">
                ONLY
              </span>{" "}
              platform combining peer-curated research, authentic storytelling,
              and verifiable portfolios for the next generation of engineers.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link href="/create" className="col-span-1">
                <Button
                  size="lg"
                  className="h-14 w-full bg-primary px-4 text-base text-primary-foreground border-2 border-brutal shadow-[6px_6px_0px_0px_rgba(128,128,128,0.5)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)] sm:w-auto sm:px-8 sm:text-lg font-head"
                >
                  Create Post <Zap className="ml-2 h-5 w-5 inline-block" />
                </Button>
              </Link>
              <Link href="/events" className="col-span-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="group h-14 w-full bg-card px-4 text-base text-card-foreground border-2 border-brutal shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm sm:w-auto sm:px-8 sm:text-lg font-head"
                >
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <div className="col-span-2 rounded-[1.5rem] border-2 border-brutal bg-card/80 px-4 py-4 shadow-brutal-sm sm:hidden">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  What happens here
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Publish standout blogs, discover live events, and turn ideas
                  into collaborative quests.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <StatPill
                label="Research posts"
                value={`${stats.approvedPosts}+`}
              />
              <StatPill
                label="Active quests"
                value={`${stats.activeQuests}+`}
              />
              <StatPill
                label="Hosted events"
                value={`${stats.approvedEvents}+`}
              />
            </div>
          </div>

          <div className="lg:pt-6">
            <VisitorCounter enabled={convexEnabled} />
          </div>
        </div>
      </div>

      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 bg-foreground/5"
        style={{
          maskImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </section>
  );
}
