"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WorkspaceChat } from "@/components/workspace/WorkspaceChat";
import { WorkspaceBoard } from "@/components/workspace/WorkspaceBoard";
import { TeamSidebar } from "@/components/workspace/TeamSidebar";
import { Badge } from "@/components/retroui/Badge";
import { getImageUrl } from "@/lib/sanity/client";
import Image from "next/image";
import {
  FaExpand,
  FaCompress,
  FaGithub,
  FaFileLines,
  FaUsers,
  FaComments,
  FaPaintbrush,
  FaCircle,
} from "react-icons/fa6";

interface WorkspaceLayoutProps {
  collaboration: any;
}

type ActivePanel = "chat" | "board";

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  open: {
    label: "Open",
    color: "text-emerald-700",
    bg: "bg-emerald-100 border-emerald-400",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-100 border-amber-400",
  },
  completed: {
    label: "Completed",
    color: "text-blue-700",
    bg: "bg-blue-100 border-blue-400",
  },
};

export function WorkspaceLayout({ collaboration }: WorkspaceLayoutProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("board");
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isBoardExpanded, setIsBoardExpanded] = useState(false);
  const [showTeam, setShowTeam] = useState(true);

  const status = statusConfig[collaboration.status] || statusConfig.open;
  const allMembers = [
    collaboration.postedBy,
    ...(collaboration.teamMembers || []),
  ];
  const memberCount = allMembers.length;

  return (
    <div className="flex flex-col h-full">
      {/* ── Workspace Header ─────────────────────────────── */}
      <div className="flex-shrink-0 border-b-2 border-black bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Project info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#e85d2c] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {collaboration.projectName?.charAt(0) || "P"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-head font-black text-lg truncate">
                  {collaboration.projectName}
                </h1>
                <Badge
                  className={`text-[10px] px-2 py-0.5 border ${status.bg} ${status.color} font-bold`}
                >
                  {status.label}
                </Badge>
              </div>
              {collaboration.skillsNeeded?.length > 0 && (
                <div className="flex gap-1.5 mt-0.5 flex-wrap">
                  {collaboration.skillsNeeded
                    .slice(0, 4)
                    .map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[10px] px-1.5 py-0.5 bg-[#FFF0E8] text-[#FF6B35] border border-[#FF6B35]/30 rounded font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  {collaboration.skillsNeeded.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{collaboration.skillsNeeded.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Links + Team avatars */}
          <div className="flex items-center gap-3">
            {collaboration.githubRepo && (
              <a
                href={collaboration.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A2947] text-white border-2 border-black rounded-md shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs font-bold"
              >
                <FaGithub className="text-sm" /> Repo
              </a>
            )}
            {collaboration.designDoc && (
              <a
                href={collaboration.designDoc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1A2947] border-2 border-black rounded-md shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs font-bold"
              >
                <FaFileLines className="text-sm" /> Docs
              </a>
            )}

            {/* Team avatar stack */}
            <div className="flex items-center gap-1 ml-1">
              <div className="flex -space-x-2">
                {allMembers.slice(0, 4).map((member: any, i: number) => (
                  <div
                    key={member._id || i}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center"
                    title={member.name}
                  >
                    {member.avatar ? (
                      <Image
                        src={getImageUrl(member.avatar)!}
                        alt={member.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-orange-800">
                        {member.name?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                ))}
                {memberCount > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    +{memberCount - 4}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-medium ml-1.5 hidden sm:inline">
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Switcher ─────────────────────────── */}
      <div className="flex md:hidden gap-1 p-1 mx-3 mt-2 bg-[#FFF0E8] border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        <button
          onClick={() => setActivePanel("chat")}
          className={`flex-1 py-2 font-head font-bold rounded-md flex items-center justify-center gap-2 transition-all text-sm
                        ${
                          activePanel === "chat"
                            ? "bg-[#FF6B35] text-white border-2 border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
        >
          <FaComments className="text-xs" /> Chat & Team
        </button>
        <button
          onClick={() => setActivePanel("board")}
          className={`flex-1 py-2 font-head font-bold rounded-md flex items-center justify-center gap-2 transition-all text-sm
                        ${
                          activePanel === "board"
                            ? "bg-[#FF6B35] text-white border-2 border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
        >
          <FaPaintbrush className="text-xs" /> Whiteboard
        </button>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex gap-0 min-h-0 p-3 pt-2">
        <AnimatePresence mode="popLayout">
          {/* ─── Left Panel: Chat + Team ─────────────── */}
          {!isBoardExpanded && (
            <motion.div
              layout
              key="left-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                width: isChatExpanded ? "100%" : undefined,
              }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`flex flex-col gap-2 h-full ${
                isChatExpanded ? "flex-1" : "w-full md:w-[320px] lg:w-[360px]"
              } ${activePanel !== "chat" ? "hidden md:flex" : "flex"} flex-shrink-0`}
            >
              {/* Chat */}
              <div
                className={`${showTeam && !isChatExpanded ? "flex-1 min-h-0" : "flex-1"} overflow-hidden`}
              >
                <WorkspaceChat
                  collaborationId={collaboration._id}
                  initialMessages={collaboration.messages}
                  isExpanded={isChatExpanded}
                  onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
                />
              </div>

              {/* Team sidebar collapsed into bottom */}
              {!isChatExpanded && (
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setShowTeam(!showTeam)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border-2 border-black rounded-t-lg font-head font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FaUsers className="text-[#FF6B35]" />
                      Team ({memberCount})
                    </span>
                    <span
                      className={`text-xs transition-transform ${showTeam ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </button>
                  <AnimatePresence>
                    {showTeam && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <TeamSidebar
                          members={collaboration.teamMembers}
                          postedBy={collaboration.postedBy}
                          projectInfo={{
                            description: collaboration.description,
                            duration: collaboration.duration,
                            commitment: collaboration.commitment,
                            githubRepo: collaboration.githubRepo,
                            designDoc: collaboration.designDoc,
                            skillsNeeded: collaboration.skillsNeeded,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Right Panel: Whiteboard ─────────────── */}
          {!isChatExpanded && (
            <motion.div
              layout
              key="right-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`flex-1 h-full relative ml-2 ${
                activePanel !== "board" ? "hidden md:block" : "block"
              }`}
            >
              {/* Board controls overlay */}
              <div className="absolute top-3 right-3 z-50 hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsBoardExpanded(!isBoardExpanded)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-md hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-xs"
                >
                  {isBoardExpanded ? (
                    <>
                      <FaCompress className="text-xs" /> Split
                    </>
                  ) : (
                    <>
                      <FaExpand className="text-xs" /> Focus
                    </>
                  )}
                </button>
              </div>

              <WorkspaceBoard collaborationId={collaboration._id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
