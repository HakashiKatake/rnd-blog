import { QueryCtx, MutationCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function requireMembership(ctx: AuthCtx, workspaceId: string) {
  const identity = await requireIdentity(ctx);
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_workspace_user", (query) =>
      query.eq("workspaceId", workspaceId).eq("userId", identity.subject),
    )
    .unique();

  if (!membership || !membership.active) {
    throw new Error("Not authorized for this workspace");
  }

  return {
    identity,
    membership,
  };
}
