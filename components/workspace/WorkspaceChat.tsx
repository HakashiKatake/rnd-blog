'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
import { FaPaperPlane, FaExpand, FaCompress, FaEllipsisVertical } from 'react-icons/fa6'
import { client } from '@/lib/sanity/client'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface WorkspaceChatProps {
    collaborationId: string
    initialMessages: any[]
    isExpanded: boolean
    onToggleExpand: () => void
}

export function WorkspaceChat({ collaborationId, initialMessages, isExpanded, onToggleExpand }: WorkspaceChatProps) {
    const { user } = useUser()
    const [messages, setMessages] = useState(initialMessages || [])
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Edit state
    const [editingMessageKey, setEditingMessageKey] = useState<string | null>(null)
    const [editText, setEditText] = useState('')

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const fetchMessages = async () => {
        const updateddata = await client.withConfig({ useCdn: false }).fetch(`*[_type == "collaboration" && _id == $id][0].messages[] {
            _key,
            text,
            timestamp,
            "user": user->{name, avatar, clerkId}
        }`, { id: collaborationId })

        if (updateddata) {
            setMessages((prev) => {
                const serverMessages = updateddata || []
                const lastServerTime = serverMessages.length > 0
                    ? new Date(serverMessages[serverMessages.length - 1].timestamp).getTime()
                    : 0

                const pendingMessages = prev.filter(m => {
                    const mTime = new Date(m.timestamp).getTime()
                    return !m._key && mTime > lastServerTime
                })

                return [...serverMessages, ...pendingMessages]
            })
        }
    }

    // Poll for new messages
    useEffect(() => {
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [collaborationId])

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return

        setIsSending(true)
        const tempMsg = {
            text: newMessage,
            timestamp: new Date().toISOString(),
            user: {
                name: user.fullName,
                avatar: user.imageUrl,
                clerkId: user.id
            }
        }

        setMessages((prev) => [...prev, tempMsg])
        setNewMessage('')

        try {
            const res = await fetch('/api/collaborate/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collaborationId, text: tempMsg.text })
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to send')
            }

            await fetchMessages()
        } catch (e: any) {
            console.error(e)
            toast.error(`Failed: ${e.message}`)
            // Rollback optimistic message
            setMessages(prev => prev.filter(m => m !== tempMsg))
        } finally {
            setIsSending(false)
        }
    }

    const handleDelete = async (messageKey: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return
        setMessages(prev => prev.filter(m => m._key !== messageKey))
        try {
            await fetch('/api/collaborate/message/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collaborationId, messageKey })
            })
            toast.success('Message deleted')
            fetchMessages()
        } catch (e) {
            toast.error('Failed to delete')
        }
    }

    const handleEdit = async () => {
        if (!editingMessageKey) return
        const originalText = messages.find(m => m._key === editingMessageKey)?.text

        setMessages(prev => prev.map(m => m._key === editingMessageKey ? { ...m, text: editText } : m))
        setEditingMessageKey(null)

        try {
            await fetch('/api/collaborate/message/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collaborationId,
                    messageKey: editingMessageKey,
                    newText: editText
                })
            })
            toast.success('Message edited')
            fetchMessages()
        } catch (e) {
            toast.error('Failed to edit')
            if (originalText) {
                setMessages(prev => prev.map(m => m._key === editingMessageKey ? { ...m, text: originalText } : m))
            }
        }
    }

    const startEditing = (msg: any) => {
        if (!msg._key) return
        setEditingMessageKey(msg._key)
        setEditText(msg.text)
    }

    return (
        <Card className="h-full flex flex-col border-brutal bg-card">
            <div className="p-4 border-b-2 border-black bg-muted flex items-center justify-between">
                <h3 className="font-bold text-lg">Chat</h3>
                <button onClick={onToggleExpand} className="p-1 hover:bg-black/10 rounded">
                    {isExpanded ? <FaCompress /> : <FaExpand />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages && messages.map((msg, idx) => {
                    const isMe = Boolean(user?.id && msg.user?.clerkId === user.id)
                    const isEditing = Boolean(msg._key && editingMessageKey === msg._key)
                    const isOptimistic = !msg._key

                    return (
                        <div key={msg._key || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group hover:bg-black/5 p-1 rounded transition-colors relative`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted border border-black/10'} relative min-w-[120px]`}>
                                {!isMe && <div className="text-xs font-bold mb-1 opacity-70">{msg.user?.name || 'Unknown'}</div>}

                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[200px] z-10 relative">
                                        <input
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="bg-white text-black border-2 border-black/20 outline-none w-full p-2 rounded text-sm shadow-sm"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEdit()
                                                if (e.key === 'Escape') setEditingMessageKey(null)
                                            }}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingMessageKey(null)} className="text-xs font-medium text-white/80 hover:text-white px-2 py-1">Cancel</button>
                                            <button onClick={handleEdit} className="text-xs font-bold bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-100 transition-colors">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm selection:bg-black/20 pr-6 break-words whitespace-pre-wrap">{msg.text}</p>
                                )}

                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] opacity-60">
                                        {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                                    </span>
                                    {isOptimistic && isMe && (
                                        <span className="text-[9px] opacity-50 ml-2 italic">Sending...</span>
                                    )}
                                </div>

                                {isMe && !isEditing && !isOptimistic && (
                                    <div className="absolute top-2 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="p-1 rounded-full focus:outline-none hover:bg-black/10">
                                                <FaEllipsisVertical className="text-xs" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => startEditing(msg)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(msg._key)} className="text-red-500">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                {messages?.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm mt-10">
                        No messages yet. Start the conversation!
                    </div>
                )}
            </div>

            <div className="p-4 border-t-2 border-black bg-background flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 border-2 border-black rounded p-2 focus:outline-none focus:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
                />
                <Button onClick={handleSend} disabled={isSending || !newMessage.trim()} className="border-2 border-black bg-secondary text-secondary-foreground">
                    <FaPaperPlane />
                </Button>
            </div>
        </Card>
    )
}
