import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type AnnouncementItem = {
  _key?: string;
  enabled?: boolean;
  eyebrow?: string | null;
  text: string;
  ctaLabel?: string | null;
  href?: string | null;
  startAt?: string | null;
  endAt?: string | null;
};

function AnnouncementChip({
  announcement,
}: {
  announcement: AnnouncementItem;
}) {
  const isExternal =
    typeof announcement.href === "string" &&
    (announcement.href.startsWith("http://") ||
      announcement.href.startsWith("https://"));

  const content = (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white backdrop-blur-sm sm:gap-3 sm:px-4">
      <span className="rounded-full border border-white/30 bg-black/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white/90 sm:px-2.5 sm:text-[10px] sm:tracking-[0.28em]">
        {announcement.eyebrow || "New"}
      </span>
      <span className="max-w-[8.2rem] truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-white sm:max-w-none sm:text-sm sm:tracking-[0.16em] md:text-base">
        {announcement.text}
      </span>
      <span className="rounded-full border border-white/30 bg-black/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white sm:px-2.5 sm:text-[10px] sm:tracking-[0.24em]">
        {announcement.ctaLabel || "Learn more"}
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
    </span>
  );

  if (!announcement.href) {
    return content;
  }

  if (isExternal) {
    return (
      <a
        href={announcement.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={announcement.href} className="inline-flex">
      {content}
    </Link>
  );
}

export function AnnouncementStrip({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  if (announcements.length === 0) {
    return null;
  }

  const repeatedAnnouncements = Array.from({ length: 4 }).flatMap(() => announcements);

  const track = (
    <div className="flex min-w-max items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6">
      {repeatedAnnouncements.map((announcement, index) => (
        <AnnouncementChip
          key={`${announcement._key || announcement.text}-${index}`}
          announcement={announcement}
        />
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y-2 border-brutal bg-gradient-to-r from-secondary via-[#22335c] to-primary shadow-brutal-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent sm:w-16" />
      <div className="announcement-marquee flex w-max items-center" data-no-swipe="true">
        {track}
        {track}
        {track}
      </div>
    </div>
  );
}
