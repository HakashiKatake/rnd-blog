import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { Navigation } from "@/components/layout/Navigation";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth/user";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    await getOrCreateUser();
  }

  const startBuildingHref = userId ? "/explore" : "/sign-up";

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* New Badge */}
            <Badge className="mb-6 inline-block bg-accent text-accent-foreground">
              Beta Launch • Join the RnD Revolution ⚡
            </Badge>

            {/* Main Heading */}
            <h1 className="font-head text-5xl lg:text-7xl font-bold mb-6">
              Ignite Ideas.{" "}
              <span className="text-outlined text-primary">Build Together.</span>{" "}
              Prove Your Work.
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The ONLY platform combining peer-curated research, authentic
              storytelling, verifiable portfolios, and collaborative
              community—built for Gen Z engineers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={startBuildingHref}>
                <Button
                  className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm active:shadow-none transition-all"
                  size="lg"
                >
                  Start Building ⚡
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  variant="outline"
                  className="border-brutal shadow-brutal hover:shadow-brutal-sm active:shadow-none transition-all"
                  size="lg"
                >
                  Explore Projects
                </Button>
              </Link>
            </div>

          </div>
        </section>

        {/* Features Grid - Bento Style */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="font-head text-3xl lg:text-5xl font-bold text-center mb-12">
            Why <span className="text-primary">SPARK</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Large Card */}
            <Card className="md:col-span-2 border-brutal p-8 hover:shadow-brutal transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="font-head text-2xl font-bold mb-3">
                    Peer-Curated Research
                  </h3>
                  <p className="text-muted-foreground">
                    Three-tier moderation system ensures quality. Automated
                    vetting, RnD club review, and community voting—all 100%
                    transparent.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="border-brutal p-8 hover:shadow-brutal transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-head text-2xl font-bold mb-3">
                Quest System
              </h3>
              <p className="text-muted-foreground">
                "What If..." quests turn ideas into collaborative projects.
                Build with peers, earn points, grow together.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="border-brutal p-8 hover:shadow-brutal transition-all">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-head text-2xl font-bold mb-3">
                Gamification
              </h3>
              <p className="text-muted-foreground">
                4-tier progression system. Earn points, unlock badges, export
                your portfolio PDF—proof that recruiters can't ignore.
              </p>
            </Card>

            {/* Feature 4 - Wide Card */}
            <Card className="md:col-span-2 border-brutal p-8 bg-primary/5 hover:shadow-brutal transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💼</div>
                <div>
                  <h3 className="font-head text-2xl font-bold mb-3">
                    Portfolio Export
                  </h3>
                  <p className="text-muted-foreground">
                    One-click PDF with your top projects, skills, and verified
                    RnD Club badge. Attach to job applications. Stand out from
                    the crowd.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="border-brutal-thick bg-secondary text-secondary-foreground p-12 text-center">
            <h2 className="font-head text-4xl font-bold mb-8">
              Join the Movement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-outlined text-4xl lg:text-6xl font-head mb-2">
                  500+
                </div>
                <p className="text-lg">Engineering Students</p>
              </div>
              <div>
                <div className="text-outlined text-4xl lg:text-6xl font-head mb-2">
                  200+
                </div>
                <p className="text-lg">Research Posts</p>
              </div>
              <div>
                <div className="text-outlined text-4xl lg:text-6xl font-head mb-2">
                  50+
                </div>
                <p className="text-lg">Collaborative Quests</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-4 border-black py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              Built by ITM RnD Club • For Engineering Students
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
