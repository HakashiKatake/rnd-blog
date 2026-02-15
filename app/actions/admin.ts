"use server";

import { client } from "@/lib/sanity/client";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function approveEventRegistration(registrationId: string) {
    console.log(`[Approve] Starting approval for registration: ${registrationId}`);
    try {
        const query = `*[_type == "eventRegistration" && _id == $id][0]{
            ticketId,
            name,
            clerkId,
            status,
            "userEmail": user->email,
            "eventTitle": event->title,
            "startTime": event->startTime,
            "location": event->location,
            "locationType": event->locationType
        }`;

        const registration = await client.withConfig({ useCdn: false }).fetch(query, { id: registrationId });
        console.log(`[Approve] Fetched registration:`, JSON.stringify(registration, null, 2));

        if (!registration) {
            console.error(`[Approve] Registration not found for ID: ${registrationId}`);
            return { success: false, error: "Registration not found" };
        }

        let userEmail = registration.userEmail;
        console.log(`[Approve] Initial userEmail from Sanity: ${userEmail}`);

        // Fallback: If no email on Sanity user, try fetching from Clerk
        if (!userEmail && registration.clerkId) {
            console.log(`[Approve] Email missing, attempting fallback with Clerk ID: ${registration.clerkId}`);
            try {
                const clerk = await clerkClient();
                const user = await clerk.users.getUser(registration.clerkId);
                console.log(`[Approve] Fetched Clerk user:`, JSON.stringify(user, null, 2));
                userEmail = user.emailAddresses[0]?.emailAddress;
                console.log(`[Approve] Resolved email from Clerk: ${userEmail}`);
            } catch (clerkError) {
                console.error("[Approve] Failed to fetch user email from Clerk:", clerkError);
            }
        }

        if (!userEmail) {
            console.warn(`[Approve] NO EMAIL FOUND. Skipping email sending.`);
        }

        // 2. Update status in Sanity
        await client.patch(registrationId).set({ status: "approved" }).commit();
        console.log(`[Approve] Status updated to 'approved' in Sanity.`);


        // 3. Send Email using Nodemailer (Gmail)
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && userEmail) {
            console.log(`[Approve] Sending email via Gmail SMTP to: ${userEmail}`);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });

            const mailOptions = {
                from: `"Rnd Club" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: `Ticket Approved: ${registration.eventTitle}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>Your Ticket is Ready! 🎟️</h1>
                        <p>Hi ${registration.name},</p>
                        <p>Great news! Your registration for <strong>${registration.eventTitle}</strong> has been approved.</p>
                        
                        <div style="border: 2px solid #000; padding: 20px; margin: 20px 0; border-radius: 8px; background-color: #f9f9f9;">
                            <h2 style="margin-top: 0;">${registration.eventTitle}</h2>
                            <p><strong>Date:</strong> ${new Date(registration.startTime).toLocaleString()}</p>
                            <p><strong>Location:</strong> ${registration.locationType === 'virtual' ? 'Virtual Event' : registration.location}</p>
                            <p><strong>Ticket ID:</strong> ${registration.ticketId}</p>
                            <div style="margin-top: 20px; padding: 10px; background: #eee; text-align: center; font-family: monospace;">
                                (QR Code Placeholder for ${registration.ticketId})
                            </div>
                        </div>

                        <p>Please present this email or your Ticket ID at the event.</p>
                        <br/>
                        <p>See you there!</p>
                        <p>Rnd Club Team</p>
                    </div>
                `
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`[Approve] Email sent successfully. Message ID:`, info.messageId);
            } catch (error: any) {
                console.error(`[Approve] Gmail SMTP failed:`, error);
                return {
                    success: true,
                    warning: `Approved, but email failed: ${error.message}`
                };
            }
        } else {
            console.log(`[Approve] Email NOT sent. Credentials exist: ${!!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD)}, Email exists: ${!!userEmail}`);
            if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return { success: true, warning: "Approved, but Gmail credentials missing in .env" };
            if (!userEmail) return { success: true, warning: "Approved, but user email not found." };
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to approve registration:", error);
        return { success: false, error: "Failed to approve registration" };
    }
}

export async function rejectEventRegistration(registrationId: string) {
    try {
        await client.patch(registrationId).set({ status: "rejected" }).commit();
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject registration:", error);
        return { success: false, error: "Failed to reject registration" };
    }
}
