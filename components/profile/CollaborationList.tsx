import { Badge } from '@/components/retroui/Badge'

interface Collaboration {
    _id: string
    projectName: string
    description: string
    status: string
    postedBy: { name: string }
}

export function CollaborationList({ collaborations, emptyMessage = "No collaborations found." }: { collaborations: Collaboration[], emptyMessage?: string }) {
    if (collaborations.length === 0) {
        return (
            <div className="border-brutal p-8 text-center bg-card">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {collaborations.map((collab) => (
                <div key={collab._id} className="border-brutal p-6 bg-card">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-head text-lg font-bold">{collab.projectName}</h3>
                        <Badge variant="outline" className="uppercase text-xs">
                            {collab.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {collab.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                        Led by <span className="font-semibold text-foreground">{collab.postedBy?.name || 'Unknown'}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
