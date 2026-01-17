import { Badge } from '@/components/retroui/Badge'
import Link from 'next/link'

interface Quest {
    _id: string
    title: string
    status: string
    rewardPoints: number
    slug: { current: string }
}

export function QuestList({ quests, emptyMessage = "No quests found." }: { quests: Quest[], emptyMessage?: string }) {
    if (quests.length === 0) {
        return (
            <div className="border-brutal p-8 text-center bg-card">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {quests.map((quest) => (
                <div key={quest._id} className="border-brutal p-6 bg-card flex justify-between items-center group hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
                    <div>
                        <h3 className="font-head text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                            {quest.title}
                        </h3>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="uppercase text-xs">
                                {quest.status}
                            </Badge>
                            {quest.status === 'completed' && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                    +{quest.rewardPoints} XP
                                </Badge>
                            )}
                        </div>
                    </div>
                    {/* If there was a quest detail page, we would link there. For now, assuming just display. */}
                </div>
            ))}
        </div>
    )
}
