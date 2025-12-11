import { client, queries, getImageUrl } from '@/lib/sanity/client'
import Image from 'next/image'
import { Navigation } from '@/components/layout/Navigation'
import { Badge } from '@/components/retroui/Badge'

export default async function LeaderboardPage() {
  const topUsers = await client.fetch(queries.getLeaderboard)

  const tierNames = ['', 'Spark Initiate', 'Idea Igniter', 'Forge Master', 'RnD Fellow']
  const tierEmojis = ['', '⚡', '🔥', '⚙️', '🏆']

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-4 border-black bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-head text-4xl lg:text-6xl font-bold mb-4">
              Leaderboard 🏆
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Top contributors and innovators in the SPARK community. Earn
              points through posts, sparks, and collaborations.
            </p>
          </div>
        </section>

        {/* Tier Breakdown */}
        <section className="border-b-2 border-black py-6 bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((tier) => {
                const count = topUsers.filter((u: any) => u.tier === tier).length
                return (
                  <div key={tier} className="text-center">
                    <p className="text-3xl font-head font-bold">
                      {tierEmojis[tier]} {count}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tierNames[tier]}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Leaderboard Table */}
        <section className="container mx-auto px-4 py-12">
          <div className="border-brutal bg-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-primary/10 border-b-2 border-black font-head font-bold">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">User</div>
              <div className="col-span-2 text-center">Tier</div>
              <div className="col-span-2 text-center hidden md:block">Posts</div>
              <div className="col-span-2 text-center">Points</div>
            </div>

            {/* Users */}
            {topUsers.map((user: any, index: number) => (
              <div
                key={user._id}
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b-2 border-black last:border-b-0 hover:bg-primary/5 transition-colors ${
                  index < 3 ? 'bg-accent/5' : ''
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 text-center">
                  <span className="font-head text-2xl font-bold">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </span>
                </div>

                {/* User Info */}
                <div className="col-span-5 flex items-center gap-3">
                  {user.avatar && getImageUrl(user.avatar) && (
                    <Image
                      src={getImageUrl(user.avatar)!}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full border border-black"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    {user.university && (
                      <p className="text-xs text-muted-foreground">
                        {user.university}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tier */}
                <div className="col-span-2 flex justify-center">
                  <Badge className="bg-secondary text-secondary-foreground">
                    T{user.tier} {tierEmojis[user.tier]}
                  </Badge>
                </div>

                {/* Posts */}
                <div className="col-span-2 text-center hidden md:block">
                  <p className="font-semibold">{user.postsPublished}</p>
                </div>

                {/* Points */}
                <div className="col-span-2 text-center">
                  <p className="font-head text-xl font-bold text-primary">
                    {user.points}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Point System Info */}
          <div className="mt-8 border-brutal p-6 bg-primary/5">
            <h3 className="font-head text-xl font-bold mb-4">
              How Points Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold mb-1">✍️ Create a post: +10 points</p>
                <p className="text-muted-foreground">
                  Share your research and projects
                </p>
              </div>
              <div>
                <p className="font-bold mb-1">⚡ Receive a spark: +1 point</p>
                <p className="text-muted-foreground">
                  When others appreciate your work
                </p>
              </div>
              <div>
                <p className="font-bold mb-1">🤝 Join a quest: +5 points</p>
                <p className="text-muted-foreground">
                  Collaborate on challenges
                </p>
              </div>
              <div>
                <p className="font-bold mb-1">🏆 Complete a quest: Variable</p>
                <p className="text-muted-foreground">
                  Based on difficulty (50-200 pts)
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
