import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const channelKind = v.union(v.literal("announcements"), v.literal("standard"));
const workspaceRole = v.union(v.literal("host"), v.literal("member"));

export default defineSchema({
  siteVisitors: defineTable({
    visitorId: v.string(),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
  }).index("by_visitor_id", ["visitorId"]),

  channels: defineTable({
    workspaceId: v.string(),
    slug: v.string(),
    name: v.string(),
    kind: channelKind,
    position: v.number(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_position", ["workspaceId", "position"])
    .index("by_workspace_slug", ["workspaceId", "slug"]),

  memberships: defineTable({
    workspaceId: v.string(),
    userId: v.string(),
    role: workspaceRole,
    active: v.boolean(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    syncedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_user", ["userId"]),

  messageReads: defineTable({
    workspaceId: v.string(),
    channelSlug: v.string(),
    userId: v.string(),
    lastReadAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace_user_channel", [
      "workspaceId",
      "userId",
      "channelSlug",
    ])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  messages: defineTable({
    workspaceId: v.string(),
    channelId: v.id("channels"),
    channelSlug: v.string(),
    body: v.string(),
    authorClerkId: v.string(),
    authorName: v.string(),
    authorAvatarUrl: v.optional(v.string()),
    clientMessageId: v.string(),
    createdAt: v.number(),
  })
    .index("by_channel_created", ["channelId", "createdAt", "clientMessageId"])
    .index("by_channel_author_client", [
      "channelId",
      "authorClerkId",
      "clientMessageId",
    ]),
});
