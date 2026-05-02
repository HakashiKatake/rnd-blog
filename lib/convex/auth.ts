import { auth } from "@clerk/nextjs/server";

export interface ConvexTokenResult {
  token?: string;
  reason?: string;
}

export async function getConvexToken(): Promise<ConvexTokenResult> {
  try {
    const authResult = await auth();
    const token =
      (await authResult.getToken({ template: "convex" })) ?? undefined;

    if (!token) {
      return {
        reason:
          "Clerk signed you in, but did not issue a Convex token for this session.",
      };
    }

    return { token };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Clerk token error";
    console.warn(`Convex chat unavailable: ${message}`);
    return {
      reason:
        "Clerk could not create the Convex chat token for this session. The workspace still loads, but realtime chat stays disabled until that token issue is fixed.",
    };
  }
}
