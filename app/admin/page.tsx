"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/sanity/client";
import {
    approvePost,
    rejectPost,
    toggleQuestStatus,
    approveCollaboration,
    rejectCollaboration,
    approveEventRegistration,
    rejectEventRegistration
} from "../actions/admin";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import Link from "next/link";
import { FaCheck, FaXmark, FaEye, FaScroll, FaHandshake, FaNewspaper, FaTicket } from "react-icons/fa6";
import * as Tabs from "@radix-ui/react-tabs";

export default function AdminPage() {
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");

    const [posts, setPosts] = useState<any[]>([]);
    const [quests, setQuests] = useState<any[]>([]);
    const [collaborations, setCollaborations] = useState<any[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Check session storage on mount
    useEffect(() => {
        const storedAuth = sessionStorage.getItem("admin_auth");
        if (storedAuth === "true") {
            setIsAuthenticated(true);
            fetchAllData();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "333444") {
            setIsAuthenticated(true);
            sessionStorage.setItem("admin_auth", "true");
            fetchAllData();
        } else {
            setError("Incorrect password");
        }
    };

    const fetchAllData = async () => {
        setIsLoading(true);
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
        "registrations": *[_type == "eventRegistration" && status == "pending"] | order(registeredAt desc) {
            _id, name, cohort, batch, ticketId, registeredAt, clerkId, "eventName": event->title, "userEmail": user->email
        }
      }`;
            const data = await client.withConfig({ useCdn: false }).fetch(query);
            setPosts(data.posts);
            setQuests(data.quests);
            setCollaborations(data.collaborations);
            setRegistrations(data.registrations);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Actions ---

    const handlePostAction = async (id: string, action: "approve" | "reject") => {
        const fn = action === "approve" ? approvePost : rejectPost;
        const promise = fn(id);
        toast.promise(promise, {
            loading: "Updating post...",
            success: () => {
                fetchAllData();
                return `Post ${action}d!`;
            },
            error: "Failed to update post",
        });
    };

    const handleQuestStatus = async (id: string, status: string) => {
        const promise = toggleQuestStatus(id, status);
        toast.promise(promise, {
            loading: "Updating quest...",
            success: () => {
                fetchAllData();
                return "Quest updated!";
            },
            error: "Failed to update quest",
        });
    };

    const handleCollabAction = async (id: string, action: "approve" | "reject") => {
        const fn = action === "approve" ? approveCollaboration : rejectCollaboration;
        const promise = fn(id);
        toast.promise(promise, {
            loading: "Updating collaboration...",
            success: () => {
                fetchAllData();
                return `Collaboration ${action}d!`;
            },
            error: "Failed to update collaboration",
        });
    };

    const handleRegistrationAction = async (id: string, action: "approve" | "reject") => {
        const fn = action === "approve" ? approveEventRegistration : rejectEventRegistration;

        const toastId = toast.loading(action === "approve" ? "Approving & Sending Email..." : "Rejecting...");
        try {
            const result: any = await fn(id);
            if (result.success) {
                fetchAllData();
                if (result.warning) {
                    toast.warning("Registration Approved with Issue", {
                        description: result.warning,
                        id: toastId,
                        duration: 8000
                    });
                } else {
                    toast.success(`Registration ${action}d!`, { id: toastId });
                }
            } else {
                toast.error(result.error || "Failed to update registration", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred", { id: toastId });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-full max-w-md p-8 border-2 border-border bg-card rounded-lg shadow-brutal">
                    <h1 className="text-2xl font-black mb-6 text-center">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border-2 border-border rounded bg-muted/20 focus:outline-none focus:border-primary transition-colors"
                                placeholder="Enter admin password"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Button onClick={fetchAllData} variant="outline" disabled={isLoading}>
                            Refresh Data
                        </Button>
                        <Button
                            onClick={() => {
                                setIsAuthenticated(false);
                                sessionStorage.removeItem("admin_auth");
                            }}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <Tabs.Root defaultValue="registrations" className="flex flex-col gap-6">
                    <Tabs.List className="flex gap-2 border-b-2 border-border pb-px overflow-x-auto">
                        <Tabs.Trigger
                            value="registrations"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaTicket /> Registrations ({registrations.length})
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="posts"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaNewspaper /> Posts ({posts.length})
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="quests"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaScroll /> Quests ({quests.length})
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="collabs"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaHandshake /> Collaborations ({collaborations.length})
                        </Tabs.Trigger>
                    </Tabs.List>

                    {/* REGISTRATIONS TAB */}
                    <Tabs.Content value="registrations" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">Pending Event Registrations</h2>
                        </div>
                        {registrations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No pending registrations.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {registrations.map((reg) => (
                                    <div key={reg._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-muted/10 gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{reg.name} <span className="text-muted-foreground font-normal text-sm">({reg.userEmail || `Clerk: ${reg.clerkId}` || 'No Email'})</span></h3>
                                            <p className="font-medium text-primary">{reg.eventName}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {reg.cohort} • Batch {reg.batch} • {new Date(reg.registeredAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="bg-green-500 text-white border-green-700 hover:bg-green-600" onClick={() => handleRegistrationAction(reg._id, "approve")}>
                                                <FaCheck /> Approve
                                            </Button>
                                            <Button size="sm" className="bg-red-500 text-white border-red-700 hover:bg-red-600" onClick={() => handleRegistrationAction(reg._id, "reject")}>
                                                <FaXmark /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                    {/* POSTS TAB */}
                    <Tabs.Content value="posts" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">Pending Review</h2>
                        </div>
                        {posts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No pending posts.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {posts.map((post) => (
                                    <div key={post._id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                        <div>
                                            <h3 className="font-bold">{post.title}</h3>
                                            <p className="text-xs text-muted-foreground">by {post.author?.name} • {new Date(post._createdAt).toLocaleDateString()}</p>
                                            <span className="text-[10px] uppercase font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                {post.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/post/${post.slug?.current}`}
                                                target="_blank"
                                                className="p-2 hover:bg-muted rounded-md border border-transparent hover:border-border transition-all"
                                            >
                                                <FaEye />
                                            </Link>
                                            <Button size="sm" className="bg-green-500 text-white border-green-700 hover:bg-green-600" onClick={() => handlePostAction(post._id, "approve")}>
                                                <FaCheck /> Approve
                                            </Button>
                                            <Button size="sm" className="bg-red-500 text-white border-red-700 hover:bg-red-600" onClick={() => handlePostAction(post._id, "reject")}>
                                                <FaXmark /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                    {/* QUESTS TAB */}
                    <Tabs.Content value="quests" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">Manage Quests</h2>
                        </div>
                        {quests.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No quests found.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {quests.map((quest) => (
                                    <div key={quest._id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                        <div>
                                            <h3 className="font-bold">{quest.title}</h3>
                                            <p className="text-xs text-muted-foreground">Proposed by {quest.proposedBy?.name} • {new Date(quest._createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={quest.status}
                                                onChange={(e) => handleQuestStatus(quest._id, e.target.value)}
                                                className="p-1 border-2 border-border rounded bg-muted/20 text-xs font-bold"
                                            >
                                                <option value="open">Open</option>
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <Link
                                                href={`/quests/${quest.slug?.current}`}
                                                target="_blank"
                                                className="p-2 hover:bg-muted rounded-md border border-transparent hover:border-border transition-all"
                                            >
                                                <FaEye />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                    {/* COLLABORATIONS TAB */}
                    <Tabs.Content value="collabs" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">Pending Collaborations</h2>
                        </div>
                        {collaborations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No active collaborations.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {collaborations.map((collab) => (
                                    <div key={collab._id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                        <div>
                                            <h3 className="font-bold">{collab.projectName}</h3>
                                            <p className="text-xs text-muted-foreground">Posted by {collab.postedBy?.name} • {new Date(collab._createdAt).toLocaleDateString()}</p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                        ${collab.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {collab.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {collab.status !== "open" && (
                                                <Button size="sm" className="bg-green-500 text-white border-green-700 hover:bg-green-600" onClick={() => handleCollabAction(collab._id, "approve")}>
                                                    <FaCheck /> Open
                                                </Button>
                                            )}
                                            <Button size="sm" className="bg-red-500 text-white border-red-700 hover:bg-red-600" onClick={() => handleCollabAction(collab._id, "reject")}>
                                                <FaXmark /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                </Tabs.Root>
            </div>
        </div>
    );
}
