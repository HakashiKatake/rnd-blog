"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/sanity/client";
import { Badge } from "@/components/retroui/Badge";
import {
  FaGithub,
  FaFileLines,
  FaClock,
  FaBolt,
  FaUsers,
  FaInfo,
  FaCircle,
} from "react-icons/fa6";

interface TeamSidebarProps {
  members: any[];
  postedBy: any;
  projectInfo?: {
    description?: string;
    duration?: string;
    commitment?: string;
    githubRepo?: string;
    designDoc?: string;
    skillsNeeded?: string[];
  };
}

export function TeamSidebar({
  members,
  postedBy,
  projectInfo,
}: TeamSidebarProps) {
  const [tab, setTab] = useState<"team" | "project">("team");

  return (
    <div className="border-2 border-t-0 border-black rounded-b-lg bg-white overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("team")}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors
                        ${tab === "team" ? "bg-[#FFF0E8] text-[#FF6B35] border-b-2 border-[#FF6B35]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
        >
          <FaUsers className="text-[10px]" /> Members
        </button>
        <button
          onClick={() => setTab("project")}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors
                        ${tab === "project" ? "bg-[#FFF0E8] text-[#FF6B35] border-b-2 border-[#FF6B35]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
        >
          <FaInfo className="text-[10px]" /> Project Info
        </button>
      </div>

      <div className="p-3 max-h-[200px] overflow-y-auto">
        {tab === "team" ? (
          <div className="space-y-1.5">
            {/* Owner */}
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#FFF8F3] border border-[#FF6B35]/20">
              <div className="relative flex-shrink-0">
                {postedBy?.avatar ? (
                  <Image
                    src={getImageUrl(postedBy.avatar)!}
                    alt={postedBy.name}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-black w-8 h-8 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#e85d2c] border-2 border-black flex items-center justify-center text-white text-[10px] font-bold">
                    {postedBy?.name?.charAt(0) || "P"}
                  </div>
                )}
                <FaCircle className="absolute -bottom-0.5 -right-0.5 text-[8px] text-emerald-500 drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs truncate">{postedBy?.name}</p>
                  <Badge className="text-[8px] px-1 py-0 h-3.5 bg-yellow-400 text-black border border-black font-black leading-none">
                    LEAD
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Project Lead
                </p>
              </div>
            </div>

            {/* Members */}
            {members?.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  {member.avatar ? (
                    <Image
                      src={getImageUrl(member.avatar)!}
                      alt={member.name}
                      width={32}
                      height={32}
                      className="rounded-full border border-black w-8 h-8 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A2947] to-[#2d4570] border border-black flex items-center justify-center text-white text-[10px] font-bold">
                      {member.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <FaCircle className="absolute -bottom-0.5 -right-0.5 text-[8px] text-emerald-500 drop-shadow-sm" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {member.university || "Collaborator"}
                  </p>
                </div>
              </div>
            ))}

            {(!members || members.length === 0) && (
              <p className="text-muted-foreground text-[11px] italic text-center py-2">
                No other members yet.
              </p>
            )}
          </div>
        ) : (
          /* Project Info Tab */
          <div className="space-y-3">
            {projectInfo?.description && (
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">
                  About
                </p>
                <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                  {projectInfo.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {projectInfo?.duration && (
                <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border">
                  <FaClock className="text-[10px] text-[#FF6B35]" />
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                      Duration
                    </p>
                    <p className="text-[11px] font-bold">
                      {projectInfo.duration}
                    </p>
                  </div>
                </div>
              )}
              {projectInfo?.commitment && (
                <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border">
                  <FaBolt className="text-[10px] text-[#FF6B35]" />
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                      Commitment
                    </p>
                    <p className="text-[11px] font-bold">
                      {projectInfo.commitment}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="flex gap-2">
              {projectInfo?.githubRepo && (
                <a
                  href={projectInfo.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#1A2947] hover:text-[#FF6B35] transition-colors"
                >
                  <FaGithub /> GitHub
                </a>
              )}
              {projectInfo?.designDoc && (
                <a
                  href={projectInfo.designDoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#1A2947] hover:text-[#FF6B35] transition-colors"
                >
                  <FaFileLines /> Design Doc
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
