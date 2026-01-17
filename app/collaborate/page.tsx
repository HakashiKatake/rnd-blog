import Link from 'next/link'
import { client, queries } from '@/lib/sanity/client'
import { Navigation } from '@/components/layout/Navigation'
import { ProjectCard } from '@/components/collaborate/ProjectCard'
import { Button } from '@/components/retroui/Button'

export default async function CollaboratePage() {
  const collaborations = await client.fetch(queries.getOpenCollaborations)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-4 border-black bg-secondary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-head text-4xl lg:text-6xl font-bold mb-4">
              Build <span className="text-secondary-foreground">Together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Don't build alone. Find active engineering projects looking for
              your skills, or post your own project to find collaborators.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/collaborate/create">
                <Button className="font-bold border-2 border-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-primary text-primary-foreground">
                  + Post a Project
                </Button>
              </Link>
              <Button variant="outline" className="font-bold border-2 border-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-card text-foreground">
                Browsing {collaborations.length} Projects
              </Button>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="container mx-auto px-4 py-12">
          {collaborations.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-black/20">
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="font-head text-2xl font-bold mb-2">
                No open projects yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Be the first to start a collaboration!
              </p>
              <Button>Post a Project</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborations.map((project: any) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
