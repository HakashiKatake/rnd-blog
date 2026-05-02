"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import {
  FaComments,
  FaHashtag,
  FaLock,
  FaPaperPlane,
  FaTriangleExclamation,
} from "react-icons/fa6";

interface WorkspaceChatProps {
  workspaceId: string;
  channelSlug: "announcements" | "team-chat" | "updates";
  title: string;
  description: string;
  convexConfigured: boolean;
  chatReady: boolean;
  chatPreparing?: boolean;
  chatUnavailableReason?: string;
  currentUserRole: "host" | "member";
  memberName: string;
  memberAvatarUrl?: string;
  canPost?: boolean;
  pinnedContent?: React.ReactNode;
}

interface ChatMessage {
  _id: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorClerkId: string;
  createdAt: number;
}

interface ChannelUnreadState {
  channelSlug: string;
  lastReadAt: number;
  latestMessageAt?: number;
  unreadCount: number;
}

function formatMessageTime(timestamp: number) {
  try {
    return format(new Date(timestamp), "HH:mm");
  } catch {
    return "";
  }
}

function formatDateSeparator(timestamp: number) {
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
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SetupNotice({ reason }: { reason?: string }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="border-b border-[#E5E0D8] bg-white px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
          <FaTriangleExclamation className="text-[#FF5C00]" />
          Chat setup required
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#FCFBF8] px-6 text-center">
        <div className="max-w-md rounded-2xl border border-[#E5E0D8] bg-white p-6">
          <p className="text-sm font-semibold text-[#181512]">
            Realtime workspace chat is unavailable right now.
          </p>
          <p className="mt-2 text-sm leading-6 text-[#7A7267]">
            {reason ||
              "Add `NEXT_PUBLIC_CONVEX_URL`, configure the Clerk Convex JWT issuer, and run `npx convex dev` to enable realtime workspace chat."}
          </p>
        </div>
      </div>
    </div>
  );
}

function SyncedRealtimeWorkspaceChat({
  workspaceId,
  channelSlug,
  title,
  description,
  canPost = true,
  pinnedContent,
}: Pick<
  WorkspaceChatProps,
  "workspaceId" | "channelSlug" | "title" | "description" | "canPost" | "pinnedContent"
>) {
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastChannelRef = useRef(channelSlug);

  const sendMessage = useMutation(api.messages.send);
  const markRead = useMutation(api.messages.markRead);
  const unreadSummary = useQuery(api.messages.unreadSummary, {
    workspaceId,
  }) as ChannelUnreadState[] | undefined;
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    {
      workspaceId,
      channelSlug,
    },
    { initialNumItems: 30 },
  );

  const messages = useMemo(() => {
    return [...(results || [])].reverse() as ChatMessage[];
  }, [results]);
  const channelUnreadState = unreadSummary?.find(
    (entry) => entry.channelSlug === channelSlug,
  );

  const latestMessageId = messages[messages.length - 1]?._id;
  const latestMessageAt = messages[messages.length - 1]?.createdAt;
  const lastMarkedReadRef = useRef(0);

  useEffect(() => {
    if (!scrollRef.current) return;

    const channelChanged = lastChannelRef.current !== channelSlug;
    if (channelChanged) {
      lastChannelRef.current = channelSlug;
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      return;
    }

    if (latestMessageId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelSlug, latestMessageId]);

  useEffect(() => {
    if (!latestMessageAt || !channelUnreadState) return;

    const readAt = Math.max(channelUnreadState.lastReadAt, latestMessageAt);
    if (readAt <= lastMarkedReadRef.current) return;

    lastMarkedReadRef.current = readAt;

    void markRead({
      workspaceId,
      channelSlug,
      readAt,
    }).catch((error) => {
      console.error(error);
      lastMarkedReadRef.current = Math.min(lastMarkedReadRef.current, 0);
    });
  }, [
    channelSlug,
    channelUnreadState,
    latestMessageAt,
    markRead,
    workspaceId,
  ]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !canPost || !user) return;

    setIsSending(true);

    try {
      await sendMessage({
        workspaceId,
        channelSlug,
        body: trimmed,
        clientMessageId: crypto.randomUUID(),
      });
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  let lastDate = "";
  let unreadSeparatorShown = false;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E5E0D8] bg-white px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5C00] text-white">
              <FaHashtag className="text-xs" />
            </div>
            <h3 className="text-sm font-semibold text-[#111111]">{title}</h3>
          </div>
          <p className="mt-1 text-xs text-[#7A7267]">{description}</p>
        </div>
        <span className="rounded-full bg-[#F3EFE7] px-2 py-0.5 font-mono text-[10px] text-[#7A7267]">
          {messages.length} msgs
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#FCFBF8] px-5 py-4" ref={scrollRef}>
        {status === "CanLoadMore" || status === "LoadingMore" ? (
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => loadMore(20)}
              disabled={status === "LoadingMore"}
              className="rounded-full border border-[#E5E0D8] bg-white px-3 py-1 text-xs font-medium text-[#5E564B] transition hover:border-[#FF5C00] hover:text-[#FF5C00] disabled:opacity-60"
            >
              {status === "LoadingMore" ? "Loading history..." : "Load older messages"}
            </button>
          </div>
        ) : null}

        {pinnedContent ? <div className="mb-4">{pinnedContent}</div> : null}

        {messages.length > 0 ? (
          <div className="space-y-1">
            {messages.map((message) => {
              const isMe = Boolean(user?.id && message.authorClerkId === user.id);
              const separator = formatDateSeparator(message.createdAt);
              const shouldShowSeparator = separator && separator !== lastDate;
              const shouldShowUnreadSeparator = Boolean(
                !unreadSeparatorShown &&
                  channelUnreadState?.lastReadAt &&
                  message.createdAt > channelUnreadState.lastReadAt &&
                  !isMe,
              );
              if (shouldShowSeparator) {
                lastDate = separator;
              }
              if (shouldShowUnreadSeparator) {
                unreadSeparatorShown = true;
              }

              return (
                <React.Fragment key={message._id}>
                  {shouldShowSeparator ? (
                    <div className="my-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#E7E0D6]" />
                      <span className="rounded-full border border-[#E7E0D6] bg-white px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8174]">
                        {separator}
                      </span>
                      <div className="h-px flex-1 bg-[#E7E0D6]" />
                    </div>
                  ) : null}

                  {shouldShowUnreadSeparator ? (
                    <div className="my-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#FFD7C2]" />
                      <span className="rounded-full border border-[#FFD7C2] bg-[#FFF4EE] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#D94E00]">
                        New
                      </span>
                      <div className="h-px flex-1 bg-[#FFD7C2]" />
                    </div>
                  ) : null}

                  <div className={`group mt-2 flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe ? (
                      <div className="mr-2 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1A2947] to-[#2D4570] text-[10px] font-bold text-white">
                        {getInitials(message.authorName)}
                      </div>
                    ) : null}

                    <div className={`max-w-[78%] ${isMe ? "ml-auto" : ""}`}>
                      {!isMe ? (
                        <div className="mb-0.5 ml-1 text-[11px] font-semibold text-[#28231C]">
                          {message.authorName}
                        </div>
                      ) : null}

                      <div
                        className={`rounded-xl px-3 py-2 ${
                          isMe
                            ? "rounded-br-sm bg-[#FF5C00] text-white"
                            : "rounded-bl-sm border border-[#E7E0D6] bg-white text-[#28231C]"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {message.body}
                        </p>
                        <div className="mt-1 flex justify-end">
                          <span
                            className={`text-[10px] ${
                              isMe ? "text-white/70" : "text-[#8A8174]"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD5C1] bg-white">
              <FaComments className="text-2xl text-[#FF6B35]" />
            </div>
            <p className="text-sm font-semibold text-[#181512]">
              No messages yet in {title}
            </p>
            <p className="mt-1 text-xs text-[#8A8174]">
              Start the conversation to bring this channel to life.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 gap-2 border-t border-[#E5E0D8] bg-white px-5 py-4">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder={
            canPost
              ? `Message #${channelSlug}`
              : "Only the workspace host can post here"
          }
          disabled={!canPost || isSending}
          className="flex-1 rounded-xl border border-[#DED7CC] bg-[#FCFBF8] px-4 py-3 text-sm text-[#181512] outline-none transition-all placeholder:text-[#9B9287] focus:border-[#FF5C00] disabled:cursor-not-allowed disabled:bg-[#F7F5F0]"
        />
        <button
          onClick={() => void handleSend()}
          disabled={!canPost || isSending || !newMessage.trim()}
          className="flex items-center justify-center rounded-xl bg-[#FF5C00] px-4 text-white transition hover:bg-[#E65400] disabled:cursor-not-allowed disabled:opacity-50"
          title={canPost ? "Send message" : "Posting is restricted"}
        >
          {canPost ? <FaPaperPlane className="text-sm" /> : <FaLock className="text-sm" />}
        </button>
      </div>
    </div>
  );
}

function RealtimeWorkspaceChat({
  workspaceId,
  channelSlug,
  title,
  description,
  canPost = true,
  pinnedContent,
}: Pick<
  WorkspaceChatProps,
  "workspaceId" | "channelSlug" | "title" | "description" | "canPost" | "pinnedContent"
>) {
  return (
    <SyncedRealtimeWorkspaceChat
      workspaceId={workspaceId}
      channelSlug={channelSlug}
      title={title}
      description={description}
      canPost={canPost}
      pinnedContent={pinnedContent}
    />
  );
}

export function WorkspaceChat(props: WorkspaceChatProps) {
  if (!props.convexConfigured) {
    return (
      <SetupNotice reason="This environment is missing NEXT_PUBLIC_CONVEX_URL, so the Convex chat client never starts." />
    );
  }

  if (props.chatPreparing) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FCFBF8] px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-[#181512]">
            Preparing realtime workspace chat...
          </p>
          <p className="mt-2 text-sm text-[#7A7267]">
            Syncing your workspace access with Convex.
          </p>
        </div>
      </div>
    );
  }

  if (!props.chatReady) {
    return (
      <SetupNotice
        reason={
          props.chatUnavailableReason ||
          "Convex is configured, but your workspace chat access could not be synced."
        }
      />
    );
  }

  return <RealtimeWorkspaceChat {...props} />;
}
