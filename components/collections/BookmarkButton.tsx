"use client"

import { Button } from "@/components/retroui/Button"
import { FaBookmark, FaRegBookmark } from "react-icons/fa6"
import { SaveToCollectionDialog } from "./SaveToCollectionDialog"
import { useState, useEffect } from "react"

interface BookmarkButtonProps {
    postId: string
    isBookmarked?: boolean
}

export function BookmarkButton({ postId, isBookmarked: initialIsBookmarked }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)

    // Sync with prop if it changes (e.g. from parent re-render or navigation)
    useEffect(() => {
        setIsBookmarked(initialIsBookmarked)
    }, [initialIsBookmarked])

    return (
        <SaveToCollectionDialog
            postId={postId}
            onStatusChange={setIsBookmarked}
            trigger={
                <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-colors">
                    {isBookmarked ? (
                        <FaBookmark className="w-5 h-5 text-primary" />
                    ) : (
                        <FaRegBookmark className="w-5 h-5" />
                    )}
                </Button>
            }
        />
    )
}
