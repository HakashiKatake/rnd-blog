"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/retroui/Button";
import {
  FaPaperPlane,
  FaExpand,
  FaCompress,
  FaEllipsisVertical,
  FaComments,
} from "react-icons/fa6";
import { client } from "@/lib/sanity/client";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceChatProps {
  collaborationId: string;
  initialMessages: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function formatMessageTime(timestamp: string) {
  try {
    const date = new Date(timestamp);
    return format(date, "HH:mm");
  } catch {
    return "";
  }
}

function formatDateSeparator(timestamp: string) {
  try {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  } catch {
    return "";
  }
}

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WorkspaceChat({
  collaborationId,
  initialMessages,
  isExpanded,
  onToggleExpand,
}: WorkspaceChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState(initialMessages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(
    null,
  );
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const updateddata = await client.withConfig({ useCdn: false }).fetch(
        `*[_type == "collaboration" && _id == $id][0].messages[] {
                _key,
                text,
                timestamp,
                "user": user->{name, avatar, clerkId}
            }`,
        { id: collaborationId },
      );

      if (updateddata) {
        setMessages((prev) => {
          const serverMessages = updateddata || [];
          const lastServerTime =
            serverMessages.length > 0
              ? new Date(
                  serverMessages[serverMessages.length - 1].timestamp,
                ).getTime()
              : 0;

          const pendingMessages = prev.filter((m) => {
            return m._localOptimistic;
          });

          return [...serverMessages, ...pendingMessages];
        });
      }
    } catch (e) {
      // Silently fail on polling errors
    }
  };

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [collaborationId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    const tempMsg = {
      _localOptimistic: true,
      text: newMessage,
      timestamp: new Date().toISOString(),
      user: {
        name: user.fullName,
        avatar: user.imageUrl,
        clerkId: user.id,
      },
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    inputRef.current?.focus();

    try {
      const res = await fetch("/api/collaborate/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaborationId, text: tempMsg.text }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send");
      }

      await fetchMessages();
    } catch (e: any) {
      console.error(e);
      toast.error(`Failed: ${e.message}`);
      setMessages((prev) => prev.filter((m) => m !== tempMsg));
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (messageKey: string) => {
    if (!confirm("Delete this message?")) return;
    setMessages((prev) => prev.filter((m) => m._key !== messageKey));
    try {
      await fetch("/api/collaborate/message/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaborationId, messageKey }),
      });
      toast.success("Message deleted");
      fetchMessages();
    } catch (e) {
      toast.error("Failed to delete");
      fetchMessages();
    }
  };

  const handleEdit = async () => {
    if (!editingMessageKey) return;
    const originalText = messages.find(
      (m) => m._key === editingMessageKey,
    )?.text;

    setMessages((prev) =>
      prev.map((m) =>
        m._key === editingMessageKey ? { ...m, text: editText } : m,
      ),
    );
    setEditingMessageKey(null);

    try {
      await fetch("/api/collaborate/message/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaborationId,
          messageKey: editingMessageKey,
          newText: editText,
        }),
      });
      toast.success("Message edited");
      fetchMessages();
    } catch (e) {
      toast.error("Failed to edit");
      if (originalText) {
        setMessages((prev) =>
          prev.map((m) =>
            m._key === editingMessageKey ? { ...m, text: originalText } : m,
          ),
        );
      }
    }
  };

  const startEditing = (msg: any) => {
    if (!msg._key) return;
    setEditingMessageKey(msg._key);
    setEditText(msg.text);
  };

  // Group messages by date for separators
  let lastDate = "";

  return (
    <div className="h-full flex flex-col border-2 border-black rounded-lg bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] overflow-hidden">
      {/* Chat header */}
      <div className="px-4 py-3 border-b-2 border-black bg-gradient-to-r from-[#FFF8F3] to-[#FFF0E8] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#FF6B35] border-2 border-black flex items-center justify-center">
            <FaComments className="text-white text-xs" />
          </div>
          <h3 className="font-head font-black text-sm">Team Chat</h3>
          <span className="text-[10px] text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded-full border">
            {messages?.length || 0} msgs
          </span>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-1.5 hover:bg-black/10 rounded-md transition-colors border border-transparent hover:border-black/20"
          title={isExpanded ? "Collapse chat" : "Expand chat"}
        >
          {isExpanded ? (
            <FaCompress className="text-xs" />
          ) : (
            <FaExpand className="text-xs" />
          )}
        </button>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
        ref={scrollRef}
      >
        {messages && messages.length > 0 ? (
          messages.map((msg: any, idx: number) => {
            const isMe = Boolean(user?.id && msg.user?.clerkId === user.id);
            const isEditing = Boolean(
              msg._key && editingMessageKey === msg._key,
            );
            const isOptimistic = !!msg._localOptimistic;

            // Date separator
            const msgDate = msg.timestamp
              ? formatDateSeparator(msg.timestamp)
              : "";
            let showDateSep = false;
            if (msgDate && msgDate !== lastDate) {
              lastDate = msgDate;
              showDateSep = true;
            }

            // Check if same sender as previous message (for grouping)
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const sameSender =
              prevMsg && prevMsg.user?.clerkId === msg.user?.clerkId;
            const showAvatar = !sameSender || showDateSep;

            return (
              <React.Fragment key={msg._key || `opt-${idx}`}>
                {showDateSep && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 py-0.5 bg-gray-50 rounded-full border">
                      {msgDate}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                <div
                  className={`flex ${isMe ? "justify-end" : "justify-start"} group ${showAvatar ? "mt-3" : "mt-0.5"}`}
                >
                  {/* Avatar for other users */}
                  {!isMe && showAvatar && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1A2947] to-[#2d4570] flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 mt-1 border border-black/20">
                      {getInitials(msg.user?.name || "")}
                    </div>
                  )}
                  {!isMe && !showAvatar && (
                    <div className="w-7 mr-2 flex-shrink-0" />
                  )}

                  <div
                    className={`max-w-[78%] relative ${isMe ? "ml-auto" : ""}`}
                  >
                    {/* Sender name */}
                    {!isMe && showAvatar && (
                      <div className="text-[11px] font-bold text-[#1A2947] mb-0.5 ml-1">
                        {msg.user?.name || "Unknown"}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-xl px-3 py-2 relative min-w-[80px] ${
                        isMe
                          ? "bg-[#FF6B35] text-white rounded-br-sm"
                          : "bg-[#F3F4F6] text-gray-900 border border-gray-200 rounded-bl-sm"
                      } ${isOptimistic ? "opacity-70" : ""}`}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="bg-white text-black border-2 border-black/20 outline-none w-full p-2 rounded text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEdit();
                              if (e.key === "Escape")
                                setEditingMessageKey(null);
                            }}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingMessageKey(null)}
                              className="text-xs font-medium text-white/80 hover:text-white px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleEdit}
                              className="text-xs font-bold bg-white text-black px-3 py-1 rounded-md shadow hover:bg-gray-100 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm break-words whitespace-pre-wrap leading-relaxed pr-5">
                          {msg.text}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span
                          className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-400"}`}
                        >
                          {msg.timestamp
                            ? formatMessageTime(msg.timestamp)
                            : ""}
                        </span>
                        {isOptimistic && isMe && (
                          <span className="text-[9px] text-white/50 italic">
                            Sending...
                          </span>
                        )}
                      </div>

                      {/* Context menu for own messages */}
                      {isMe && !isEditing && !isOptimistic && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 rounded-full focus:outline-none hover:bg-black/10">
                              <FaEllipsisVertical className="text-[10px] text-white/70" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => startEditing(msg)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(msg._key)}
                                className="text-red-500"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0E8] border-2 border-[#FF6B35]/30 flex items-center justify-center mb-4">
              <FaComments className="text-2xl text-[#FF6B35]" />
            </div>
            <p className="font-head font-bold text-sm text-gray-700">
              No messages yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start the conversation with your team!
            </p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-3 py-3 border-t-2 border-black bg-[#FFF8F3] flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all bg-white placeholder:text-gray-400"
        />
        <Button
          onClick={handleSend}
          disabled={isSending || !newMessage.trim()}
          className="border-2 border-black bg-[#FF6B35] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 px-3"
        >
          <FaPaperPlane className="text-sm" />
        </Button>
      </div>
    </div>
  );
}
