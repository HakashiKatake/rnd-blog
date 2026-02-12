"use server";

import { client } from "@/lib/sanity/client";
import { revalidatePath } from "next/cache";

export async function approvePost(postId: string) {
    try {
        await client.patch(postId).set({ status: "approved" }).commit();
        revalidatePath("/admin");
        revalidatePath("/"); // Update home page
        revalidatePath("/explore"); // Update explore page
        return { success: true };
    } catch (error) {
        console.error("Failed to approve post:", error);
        return { success: false, error: "Failed to approve post" };
    }
}

export async function rejectPost(postId: string) {
    try {
        await client.patch(postId).set({ status: "rejected" }).commit();
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject post:", error);
        return { success: false, error: "Failed to reject post" };
    }
}

export async function toggleQuestStatus(questId: string, status: string) {
    try {
        await client.patch(questId).set({ status }).commit();
        revalidatePath("/admin");
        revalidatePath("/quests");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to update quest status:", error);
        return { success: false, error: "Failed to update quest status" };
    }
}

export async function approveCollaboration(collabId: string) {
    try {
        await client.patch(collabId).set({ status: "open" }).commit();
        revalidatePath("/admin");
        revalidatePath("/collaborate");
        return { success: true };
    } catch (error) {
        console.error("Failed to approve collaboration:", error);
        return { success: false, error: "Failed to approve collaboration" };
    }
}

export async function rejectCollaboration(collabId: string) {
    try {
        await client.patch(collabId).set({ status: "rejected" }).commit();
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject collaboration:", error);
        return { success: false, error: "Failed to reject collaboration" };
    }
}
