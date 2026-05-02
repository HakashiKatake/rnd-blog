import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireMembership } from "./lib/auth";

const MAX_MESSAGE_LENGTH = 2000;

async function getChannelBySlug(
  ctx: QueryCtx,
  workspaceId: string,
  channelSlug: string,
) {
  return await ctx.db
    .query("channels")
    .withIndex("by_workspace_slug", (q) =>
      q.eq("workspaceId", workspaceId).eq("slug", channelSlug),
    )
    .unique();
}

async function getUnreadCountForChannel(
  ctx: QueryCtx,
  channelId: Id<"channels">,
  currentUserId: string,
  lastReadAt: number,
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_channel_created", (q) =>
      q.eq("channelId", channelId).gt("createdAt", lastReadAt),
    )
    .collect();

  return messages.filter((message) => message.authorClerkId !== currentUserId).length;
}

export const list = query({
  args: {
    workspaceId: v.string(),
    channelSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId);

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_workspace_slug", (query) =>
        query
          .eq("workspaceId", args.workspaceId)
          .eq("slug", args.channelSlug),
      )
      .unique();

    if (!channel) {
      throw new Error("Channel not found");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_channel_created", (query) =>
        query.eq("channelId", channel._id),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const unreadSummary = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace_position", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .collect();

    const readRecords = await ctx.db
      .query("messageReads")
      .withIndex("by_workspace_user", (query) =>
        query.eq("workspaceId", args.workspaceId).eq("userId", identity.subject),
      )
      .collect();

    const readMap = new Map(
      readRecords.map((record) => [record.channelSlug, record.lastReadAt]),
    );

    return await Promise.all(
      channels.map(async (channel) => {
        const lastReadAt = readMap.get(channel.slug) ?? 0;
        const latestMessage = await ctx.db
          .query("messages")
          .withIndex("by_channel_created", (query) =>
            query.eq("channelId", channel._id),
          )
          .order("desc")
          .first();

        const unreadCount = latestMessage
          ? await getUnreadCountForChannel(
              ctx,
              channel._id,
              identity.subject,
              lastReadAt,
            )
          : 0;

        return {
          channelSlug: channel.slug,
          lastReadAt,
          latestMessageAt: latestMessage?.createdAt,
          unreadCount,
        };
      }),
    );
  },
});

export const markRead = mutation({
  args: {
    workspaceId: v.string(),
    channelSlug: v.string(),
    readAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);

    const channel = await getChannelBySlug(ctx, args.workspaceId, args.channelSlug);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const existingRecord = await ctx.db
      .query("messageReads")
      .withIndex("by_workspace_user_channel", (query) =>
        query
          .eq("workspaceId", args.workspaceId)
          .eq("userId", identity.subject)
          .eq("channelSlug", args.channelSlug),
      )
      .unique();

    const nextReadAt = Math.max(existingRecord?.lastReadAt ?? 0, args.readAt);

    if (!existingRecord) {
      await ctx.db.insert("messageReads", {
        workspaceId: args.workspaceId,
        channelSlug: args.channelSlug,
        userId: identity.subject,
        lastReadAt: nextReadAt,
        updatedAt: Date.now(),
      });
      return;
    }

    if (nextReadAt === existingRecord.lastReadAt) {
      return;
    }

    await ctx.db.patch(existingRecord._id, {
      lastReadAt: nextReadAt,
      updatedAt: Date.now(),
    });
  },
});

export const send = mutation({
  args: {
    workspaceId: v.string(),
    channelSlug: v.string(),
    body: v.string(),
    clientMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity, membership } = await requireMembership(
      ctx,
      args.workspaceId,
    );

    const trimmedBody = args.body.trim();
    if (!trimmedBody) {
      throw new Error("Message cannot be empty");
    }
    if (trimmedBody.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
    }

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_workspace_slug", (query) =>
        query
          .eq("workspaceId", args.workspaceId)
          .eq("slug", args.channelSlug),
      )
      .unique();

    if (!channel) {
      throw new Error("Channel not found");
    }

    if (channel.kind === "announcements" && membership.role !== "host") {
      throw new Error("Only the workspace host can post in announcements");
    }

    const existingMessage = await ctx.db
      .query("messages")
      .withIndex("by_channel_author_client", (query) =>
        query
          .eq("channelId", channel._id)
          .eq("authorClerkId", identity.subject)
          .eq("clientMessageId", args.clientMessageId),
      )
      .unique();

    if (existingMessage) {
      return {
        messageId: existingMessage._id,
        createdAt: existingMessage.createdAt,
      };
    }

    const createdAt = Date.now();
    const messageId = await ctx.db.insert("messages", {
      workspaceId: args.workspaceId,
      channelId: channel._id,
      channelSlug: args.channelSlug,
      body: trimmedBody,
      authorClerkId: identity.subject,
      authorName: membership.name,
      authorAvatarUrl: membership.avatarUrl,
      clientMessageId: args.clientMessageId,
      createdAt,
    });

    return {
      messageId,
      createdAt,
    };
  },
});
