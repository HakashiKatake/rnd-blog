'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkspaceChat } from '@/components/workspace/WorkspaceChat'
import { WorkspaceBoard } from '@/components/workspace/WorkspaceBoard'
import { TeamSidebar } from '@/components/workspace/TeamSidebar'
import { FaExpand, FaCompress } from 'react-icons/fa6'

interface WorkspaceLayoutProps {
    collaboration: any
}

type LayoutMode = 'split' | 'chat-expanded' | 'board-expanded'

export function WorkspaceLayout({ collaboration }: WorkspaceLayoutProps) {
    const [mode, setMode] = useState<LayoutMode>('split')

    const toggleChat = () => {
        setMode(mode === 'chat-expanded' ? 'split' : 'chat-expanded')
    }

    const toggleBoard = () => {
        setMode(mode === 'board-expanded' ? 'split' : 'board-expanded')
    }

    return (
        <div className="flex h-full gap-4 relative">
            <AnimatePresence mode="popLayout">

                {/* Left Side (Chat & Sidebar) */}
                {(mode === 'split' || mode === 'chat-expanded') && (
                    <motion.div
                        layout
                        key="left-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            width: mode === 'chat-expanded' ? '100%' : '25%',
                            minWidth: mode === 'chat-expanded' ? '100%' : '300px'
                        }}
                        exit={{ opacity: 0, x: -20, width: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Chat Section */}
                        <div className="flex-1 overflow-hidden">
                            <WorkspaceChat
                                collaborationId={collaboration._id}
                                initialMessages={collaboration.messages}
                                isExpanded={mode === 'chat-expanded'}
                                onToggleExpand={toggleChat}
                            />
                        </div>

                        {/* Sidebar Section */}
                        {mode !== 'chat-expanded' && (
                            <div className="h-[40%]">
                                <TeamSidebar members={collaboration.teamMembers} postedBy={collaboration.postedBy} />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Right Side (Board) */}
                {(mode === 'split' || mode === 'board-expanded') && (
                    <motion.div
                        layout
                        key="right-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            flex: mode === 'board-expanded' ? 1 : 1, // Flex 1 usually takes remaining space
                            width: mode === 'board-expanded' ? '100%' : 'auto' // Force full width if expanded
                        }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="h-full relative"
                    >
                        {/* Board Header Overlay for Expand Button */}
                        <div className="absolute top-4 right-4 z-50">
                            <button
                                onClick={toggleBoard}
                                className="p-2 bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-md hover:bg-gray-50 transition-all font-bold text-xs flex items-center gap-2"
                            >
                                {mode === 'board-expanded' ? <><FaCompress /> Shrink</> : <><FaExpand /> Expand Board</>}
                            </button>
                        </div>

                        <WorkspaceBoard />
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    )
}
