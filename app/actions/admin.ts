"use server";

import { client } from "@/lib/sanity/client";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function getAdminData() {
    try {
        const query = `{
            "posts": *[_type == "post" && status in ["draft", "pending", "pending_review"]] | order(_createdAt desc) {
              _id, title, slug, status, author->{name}, _createdAt
            },
            "quests": *[_type == "quest"] | order(_createdAt desc) {
              _id, title, slug, status, proposedBy->{name}, _createdAt
            },
            "collaborations": *[_type == "collaboration" && status != "rejected"] | order(_createdAt desc) {
              _id, projectName, status, postedBy->{name}, _createdAt
            },
            "registrations": *[_type == "eventRegistration"] | order(registeredAt desc) {
                _id, name, cohort, batch, ticketId, registeredAt, clerkId, status, "eventName": event->title, "userEmail": user->email
            },
            "events": *[_type == "event"] | order(startTime desc) {
                _id, title, slug, status, eventType, locationType, location, startTime, endTime, image, registrationLink,
                "organizer": organizer->{name},
                "registrationCount": count(*[_type == "eventRegistration" && event._ref == ^._id && status != "rejected"])
            }
          }`;
        const data = await client.withConfig({ useCdn: false }).fetch(query);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        return { success: false, error: "Failed to fetch admin data" };
    }
}

export async function approveEvent(eventId: string) {
    try {
        await client.patch(eventId).set({ status: "approved" }).commit();
        revalidatePath("/admin");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Failed to approve event:", error);
        return { success: false, error: "Failed to approve event" };
    }
}

export async function rejectEvent(eventId: string) {
    try {
        await client.patch(eventId).set({ status: "rejected" }).commit();
        revalidatePath("/admin");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject event:", error);
        return { success: false, error: "Failed to reject event" };
    }
}

export async function deleteEvent(eventId: string) {
    try {
        await client.delete(eventId);
        revalidatePath("/admin");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

export async function getHomeSettings() {
    try {
        const query = `*[_type == "homeSettings"] | order(_updatedAt desc)[0]`;
        const data = await client.withConfig({ useCdn: false }).fetch(query);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch home settings:", error);
        return { success: false, error: "Failed to fetch home settings" };
    }
}

export async function updateHomeSettings(id: string | undefined, payload: any) {
    try {
        if (id) {
            await client.patch(id).set(payload).commit();
        } else {
            await client.create({ _type: 'homeSettings', ...payload });
        }
        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to update home settings:", error);
        return { success: false, error: "Failed to update home settings" };
    }
}

export interface EventPayload {
    id?: string;
    title: string;
    description?: string;
    requirements?: string;
    eventType: string;
    locationType: string;
    location?: string;
    startTime: string;
    endTime?: string;
    registrationLink?: string;
    status: string;
    imageBase64?: string;
    imageFilename?: string;
    imageContentType?: string;
}

export async function createOrUpdateEvent(payload: EventPayload) {
    try {
        const slug = payload.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 96);

        let imageAsset = undefined;
        if (payload.imageBase64 && payload.imageFilename && payload.imageContentType) {
            const buffer = Buffer.from(payload.imageBase64.split(',')[1], 'base64');
            const asset = await client.assets.upload('image', buffer, {
                filename: payload.imageFilename,
                contentType: payload.imageContentType,
            });
            imageAsset = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
        }

        if (payload.id) {
            // Update existing event
            const patch = client.patch(payload.id).set({
                title: payload.title,
                description: payload.description || '',
                requirements: payload.requirements || '',
                eventType: payload.eventType,
                locationType: payload.locationType,
                location: payload.location || '',
                startTime: new Date(payload.startTime).toISOString(),
                endTime: payload.endTime ? new Date(payload.endTime).toISOString() : undefined,
                registrationLink: payload.registrationLink || undefined,
                status: payload.status,
                ...(imageAsset ? { image: imageAsset } : {}),
            });
            await patch.commit();
        } else {
            // Create new event
            const doc: any = {
                _type: 'event',
                title: payload.title,
                slug: { _type: 'slug', current: `${slug}-${Date.now()}` },
                description: payload.description || '',
                requirements: payload.requirements || '',
                eventType: payload.eventType,
                locationType: payload.locationType,
                location: payload.location || '',
                startTime: new Date(payload.startTime).toISOString(),
                endTime: payload.endTime ? new Date(payload.endTime).toISOString() : undefined,
                registrationLink: payload.registrationLink || undefined,
                status: payload.status,
                ...(imageAsset ? { image: imageAsset } : {}),
            };
            await client.create(doc);
        }

        revalidatePath("/admin");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Failed to save event:", error);
        return { success: false, error: "Failed to save event" };
    }
}

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

export interface EmailPayload {
    registrationId: string;
    customSubject?: string;
    customHtml?: string;
    attachments?: { filename: string; content: string; contentType: string }[];
}

export async function approveEventRegistration(payload: EmailPayload) {
    const { registrationId, customSubject, customHtml, attachments } = payload;
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

            // Generate QR Code Buffer
            const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-tickets/${registration.ticketId}`;
            const qrCodeBuffer = await QRCode.toBuffer(qrCodeUrl);

            const mailOptions = {
                from: `"Rnd Club" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: customSubject || `Ticket Approved: ${registration.eventTitle}`,
                html: customHtml || `
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
                                <img src="cid:ticket-qr-code" alt="Ticket QR Code" style="margin: 0 auto; display: block;" />
                            </div>
                        </div>

                        <p>Please present this email or your Ticket ID at the event.</p>
                        <br/>
                        <p>See you there!</p>
                        <p>Rnd Club Team</p>
                    </div>
                `,
                attachments: [
                    {
                        filename: 'ticket-qr.png',
                        content: qrCodeBuffer,
                        cid: 'ticket-qr-code' // referenced in the html img src
                    },
                    ...(attachments ? attachments.map(att => ({
                        filename: att.filename,
                        content: Buffer.from(att.content.split(',')[1], 'base64'),
                        contentType: att.contentType
                    })) : [])
                ]
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

export async function rejectEventRegistration(payload: EmailPayload) {
    const { registrationId, customSubject, customHtml, attachments } = payload;
    console.log(`[Reject] Starting rejection for registration: ${registrationId}`);
    try {
        // 1. Fetch Registration Details
        const query = `*[_type == "eventRegistration" && _id == $id][0]{
            name,
            clerkId,
            "userEmail": user->email,
            "eventTitle": event->title
        }`;

        const registration = await client.withConfig({ useCdn: false }).fetch(query, { id: registrationId });

        if (!registration) {
            return { success: false, error: "Registration not found" };
        }

        let userEmail = registration.userEmail;

        // Fallback: Try fetching from Clerk if email missing in Sanity
        if (!userEmail && registration.clerkId) {
            try {
                const clerk = await clerkClient();
                const user = await clerk.users.getUser(registration.clerkId);
                userEmail = user.emailAddresses[0]?.emailAddress;
            } catch (clerkError) {
                console.error("[Reject] Failed to fetch user email from Clerk:", clerkError);
            }
        }

        // 2. Update status in Sanity
        await client.patch(registrationId).set({ status: "rejected" }).commit();

        // 3. Send Rejection Email
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && userEmail) {
            console.log(`[Reject] Sending email to: ${userEmail}`);

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
                subject: customSubject || `Update on your registration: ${registration.eventTitle}`,
                html: customHtml || `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Registration Update</h2>
                        <p>Hi ${registration.name},</p>
                        <p>Thank you for your interest in <strong>${registration.eventTitle}</strong>.</p>
                        <p>Unfortunately, we are unable to approve your registration at this time. This could be due to capacity limits or specific eligibility criteria for this event.</p>
                        <br/>
                        <p>We hope to see you at our future events!</p>
                        <p>Best regards,</p>
                        <p>Rnd Club Team</p>
                    </div>
                `,
                attachments: attachments ? attachments.map(att => ({
                    filename: att.filename,
                    content: Buffer.from(att.content.split(',')[1], 'base64'),
                    contentType: att.contentType
                })) : []
            };

            await transporter.sendMail(mailOptions);
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject registration:", error);
        return { success: false, error: "Failed to reject registration" };
    }
}
