"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/retroui/Button"
import { FaBookmark, FaPlus, FaCheck } from "react-icons/fa6"
import { toast } from "sonner"

interface Collection {
    _id: string
    title: string
    postCount: number
    posts: any[]
    isPrivate?: boolean
}

interface SaveToCollectionDialogProps {
    postId: string
    trigger?: React.ReactNode
    onStatusChange?: (isSaved: boolean) => void
}

export function SaveToCollectionDialog({ postId, trigger, onStatusChange }: SaveToCollectionDialogProps) {
    const [open, setOpen] = useState(false)
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(false)
    const [newCollectionTitle, setNewCollectionTitle] = useState("")
    const [creating, setCreating] = useState(false)

    // Fetch collections when dialog opens
    useEffect(() => {
        if (open) {
            fetchCollections()
        }
    }, [open])

    const fetchCollections = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/collections")
            if (!res.ok) throw new Error(`Status: ${res.status}`)

            const data = await res.json()
            if (data.collections) {
                setCollections(data.collections)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load collections")
        } finally {
            setLoading(false)
        }
    }

    const createCollection = async () => {
        if (!newCollectionTitle.trim()) return
        setCreating(true)
        try {
            const res = await fetch("/api/collections", {
                method: "POST",
                body: JSON.stringify({ title: newCollectionTitle, isPrivate: true })
            })
            const data = await res.json()
            if (data.collection) {
                setCollections([data.collection, ...collections])
                setNewCollectionTitle("")
                toast.success("Collection created")
                // Auto-save to new collection
                handleToggleSave(data.collection._id, 'add')
            }
        } catch (error) {
            toast.error("Failed to create collection")
        } finally {
            setCreating(false)
        }
    }

    const handleToggleSave = async (collectionId: string, action: 'add' | 'remove') => {
        try {
            // Optimistic update - can be improved but focusing on correctness first

            // Send request
            const res = await fetch("/api/collections/manage", {
                method: "POST",
                body: JSON.stringify({ collectionId, postId, action })
            })

            if (!res.ok) {
                const text = await res.text()
                console.error("API Error:", text)
                throw new Error("Failed to update")
            }

            const data = await res.json()

            if (data.message === 'Already saved') {
                toast.info("This post is already in that collection")
                // Still refresh to ensure UI is in sync
                await fetchCollections()
                return
            }

            toast.success(action === 'add' ? "Saved to collection" : "Removed from collection")

            // Re-fetch to get consistent state
            await fetchCollections()

        } catch (error) {
            console.error("Manage collection error:", error)
            toast.error("Failed to update collection")
        }
    }

    // Recalculate global 'bookmarked' status whenever collections change
    useEffect(() => {
        if (collections.length >= 0 && onStatusChange) {
            const isSavedAnywhere = collections.some(c =>
                c.posts?.some((p: any) => p._id === postId || p._ref === postId)
            )
            onStatusChange(isSavedAnywhere)
        }
    }, [collections, postId, onStatusChange])

    const isPostSaved = (collection: Collection) => {
        return collection.posts?.some((p: any) => p._id === postId || p._ref === postId) // Check both id (expanded) and ref (raw)
    }

    // Check if post is in ANY collection to update parent icon status
    const updateParentStatus = (currentCollections: Collection[]) => {
        if (trigger && (trigger as any).props && typeof (trigger as any).props.onStatusChange === 'function') {
            // This is handled via standard prop callback `onStatusChange` passed to the component, not trigger props directly
            // We need to accept a prop in this component
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (val) fetchCollections() // Fetch whenever opened
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <FaBookmark />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="border-brutal shadow-brutal bg-background sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Save to Collection</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Create New */}
                    <div className="flex gap-2">
                        <input
                            placeholder="New collection name..."
                            className="flex-1 p-2 border-2 border-black rounded"
                            value={newCollectionTitle}
                            onChange={(e) => setNewCollectionTitle(e.target.value)}
                        />
                        <Button
                            onClick={createCollection}
                            disabled={creating || !newCollectionTitle.trim()}
                            className="border-2 border-black bg-primary text-primary-foreground"
                        >
                            <FaPlus />
                        </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <p className="text-center text-muted-foreground">Loading...</p>
                        ) : collections.length === 0 ? (
                            <p className="text-center text-muted-foreground">No collections yet.</p>
                        ) : (
                            collections.map(collection => {
                                const saved = isPostSaved(collection)
                                return (
                                    <div
                                        key={collection._id}
                                        className="flex items-center justify-between p-3 border-2 border-black/10 hover:bg-muted/50 rounded cursor-pointer transition-colors"
                                        onClick={() => handleToggleSave(collection._id, saved ? 'remove' : 'add')}
                                    >
                                        <div>
                                            <p className="font-bold">{collection.title}</p>
                                            <p className="text-xs text-muted-foreground">{collection.postCount || 0} items • {collection.isPrivate ? 'Private' : 'Public'}</p>
                                        </div>
                                        {saved && <FaCheck className="text-success" />}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
