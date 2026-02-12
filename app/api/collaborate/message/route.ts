import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collaborationId, text } = await req.json();

    if (!collaborationId || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get the Sanity user ID for this Clerk user
    const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`;
    const sanityUserId = await client.fetch(userQuery);

    if (!sanityUserId) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    // Add message to the collaboration document
    // IMPORTANT: _key is required for Sanity array items
    const messageKey = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    await client
      .patch(collaborationId)
      .setIfMissing({ messages: [] })
      .append("messages", [
        {
          _key: messageKey,
          text,
          user: { _type: "reference", _ref: sanityUserId },
          timestamp: new Date().toISOString(),
        },
      ])
      .commit();

    return NextResponse.json({ success: true, messageKey });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
