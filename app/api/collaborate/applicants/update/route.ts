import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/sanity/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collaborationId, applicantKey, decision } = await req.json();

    if (
      !collaborationId ||
      !applicantKey ||
      !["accepted", "rejected"].includes(decision)
    ) {
      return NextResponse.json(
        { error: "Invalid applicant update request" },
        { status: 400 },
      );
    }

    const collaboration = await client.fetch(
      `*[_type == "collaboration" && _id == $collaborationId][0]{
        _id,
        maxPositions,
        "postedByClerkId": postedBy->clerkId,
        "teamMemberIds": teamMembers[]._ref,
        "applicant": applicants[_key == $applicantKey][0]{
          _key,
          status,
          "userId": user._ref
        }
      }`,
      { collaborationId, applicantKey },
    );

    if (!collaboration?._id) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 },
      );
    }

    if (collaboration.postedByClerkId !== userId) {
      return NextResponse.json(
        { error: "Only the project host can manage join requests" },
        { status: 403 },
      );
    }

    if (!collaboration.applicant?.userId) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    if (decision === "accepted") {
      const occupiedSeats = collaboration.teamMemberIds?.length || 0;

      if (
        typeof collaboration.maxPositions === "number" &&
        occupiedSeats >= collaboration.maxPositions &&
        !collaboration.teamMemberIds?.includes(collaboration.applicant.userId)
      ) {
        return NextResponse.json(
          { error: "This project has no open seats left." },
          { status: 409 },
        );
      }
    }

    let patch = client.patch(collaborationId).set({
      [`applicants[_key=="${applicantKey}"].status`]: decision,
    });

    if (
      decision === "accepted" &&
      !collaboration.teamMemberIds?.includes(collaboration.applicant.userId)
    ) {
      patch = patch.setIfMissing({ teamMembers: [] }).append("teamMembers", [
        {
          _type: "reference",
          _ref: collaboration.applicant.userId,
        },
      ]);
    }

    await patch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating collaboration applicant:", error);
    return NextResponse.json(
      { error: "Failed to update applicant status" },
      { status: 500 },
    );
  }
}
