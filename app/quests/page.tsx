import { client, queries } from "@/lib/sanity/client";
import { auth } from "@clerk/nextjs/server";
import { Navigation } from "@/components/layout/Navigation";
import { QuestCard } from "@/components/quests/QuestCard";
import { Badge } from "@/components/retroui/Badge";

export default async function QuestsPage() {
  const { userId } = await auth();
  const questsPromise = client.fetch(queries.getActiveQuests);
  const myQuestIdsPromise = userId
    ? client.fetch(queries.getUserQuestIds(userId))
    : Promise.resolve([]);

  const [quests, myQuestIds] = await Promise.all([
    questsPromise,
    myQuestIdsPromise,
  ]);
  const joinedSet = new Set(myQuestIds);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-4 border-black bg-accent/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-head text-4xl lg:text-6xl font-bold mb-4">
              What If...{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                Quests
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Join collaborative challenges to build innovative projects with
              fellow engineers. Turn "What If..." into reality.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b-2 border-black py-6 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-head font-bold">{quests.length}</p>
                <p className="text-sm text-muted-foreground">Active Quests</p>
              </div>
              <div>
                <p className="text-3xl font-head font-bold">
                  {quests.reduce(
                    (acc: number, q: any) => acc + q.participantCount,
                    0,
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quests Grid */}
        <section className="container mx-auto px-4 py-12">
          {quests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="font-head text-2xl font-bold mb-2">
                No active quests yet
              </h2>
              <p className="text-muted-foreground">
                Be the first to propose a "What If..." challenge!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map((quest: any) => (
                <QuestCard
                  key={quest._id}
                  quest={quest}
                  isJoined={joinedSet.has(quest._id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
