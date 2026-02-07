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
    const [activeTab, setActiveTab] = useState<'chat' | 'board'>('chat')

    const toggleChat = () => {
        setMode(mode === 'chat-expanded' ? 'split' : 'chat-expanded')
    }

    const toggleBoard = () => {
        setMode(mode === 'board-expanded' ? 'split' : 'board-expanded')
    }

    return (
        <div className="flex flex-col h-full gap-4 relative">
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden gap-2 p-1 bg-muted border-2 border-black rounded-lg shadow-brutal-sm">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 font-head font-bold rounded-md transition-all ${activeTab === 'chat' ? 'bg-primary text-primary-foreground border-2 border-black' : 'text-muted-foreground'
                        }`}
                >
                    Chat & Team
                </button>
                <button
                    onClick={() => setActiveTab('board')}
                    className={`flex-1 py-2 font-head font-bold rounded-md transition-all ${activeTab === 'board' ? 'bg-primary text-primary-foreground border-2 border-black' : 'text-muted-foreground'
                        }`}
                >
                    Board
                </button>
            </div>

            <div className="flex-1 flex h-full gap-4 min-h-0">
                <AnimatePresence mode="popLayout">

                    {/* Left Side (Chat & Sidebar) */}
                    {((mode === 'split' || mode === 'chat-expanded') && (activeTab === 'chat' || typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                        <motion.div
                            layout
                            key="left-panel"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                width: mode === 'chat-expanded' ? '100%' : (typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : '30%'),
                                display: (activeTab === 'chat' || (typeof window !== 'undefined' && window.innerWidth >= 768)) ? 'flex' : 'none'
                            }}
                            exit={{ opacity: 0, x: -20, width: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="flex flex-col gap-4 h-full"
                        >
                            {/* Chat Section */}
                            <div className="flex-1 overflow-hidden min-h-0">
                                <WorkspaceChat
                                    collaborationId={collaboration._id}
                                    initialMessages={collaboration.messages}
                                    isExpanded={mode === 'chat-expanded'}
                                    onToggleExpand={toggleChat}
                                />
                            </div>

                            {/* Sidebar Section */}
                            {mode !== 'chat-expanded' && (
                                <div className="h-[35%] shrink-0">
                                    <TeamSidebar members={collaboration.teamMembers} postedBy={collaboration.postedBy} />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Right Side (Board) */}
                    {((mode === 'split' || mode === 'board-expanded') && (activeTab === 'board' || typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                        <motion.div
                            layout
                            key="right-panel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                flex: 1,
                                width: mode === 'board-expanded' ? '100%' : (typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto'),
                                display: (activeTab === 'board' || (typeof window !== 'undefined' && window.innerWidth >= 768)) ? 'block' : 'none'
                            }}
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="h-full relative"
                        >
                            {/* Board Header Overlay for Expand Button - Hidden on Mobile */}
                            <div className="absolute top-4 right-4 z-50 hidden md:block">
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
        </div>
    )
}
