import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getVisitorStats = query({
  args: {},
  handler: async (ctx) => {
    const visitors = await ctx.db.query("siteVisitors").collect();

    return {
      totalVisitors: visitors.length,
      lastUpdatedAt:
        visitors.reduce(
          (latest, visitor) => Math.max(latest, visitor.lastSeenAt),
          0,
        ) || null,
    };
  },
});

export const trackVisitor = mutation({
  args: {
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedVisitorId = args.visitorId.trim();
    if (!normalizedVisitorId) {
      throw new Error("Visitor id is required");
    }

    const existingVisitor = await ctx.db
      .query("siteVisitors")
      .withIndex("by_visitor_id", (query) =>
        query.eq("visitorId", normalizedVisitorId),
      )
      .unique();

    const now = Date.now();

    if (existingVisitor) {
      await ctx.db.patch(existingVisitor._id, {
        lastSeenAt: now,
      });

      return {
        totalVisitors: null,
        isNewVisitor: false,
      };
    }

    await ctx.db.insert("siteVisitors", {
      visitorId: normalizedVisitorId,
      firstSeenAt: now,
      lastSeenAt: now,
    });

    const totalVisitors = (await ctx.db.query("siteVisitors").collect()).length;

    return {
      totalVisitors,
      isNewVisitor: true,
    };
  },
});
