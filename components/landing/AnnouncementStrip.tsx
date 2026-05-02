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
    <span className="inline-flex items-center gap-4 px-8 py-3 text-black">
      {announcement.eyebrow && (
        <span className="border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)]">
          {announcement.eyebrow}
        </span>
      )}
      <span className="font-head text-lg sm:text-xl font-black uppercase tracking-[0.2em]">
        {announcement.text}
      </span>
      {announcement.ctaLabel && (
        <span className="border-2 border-black bg-[#ff6b35] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all">
          {announcement.ctaLabel}
        </span>
      )}
      <ArrowRight className="h-6 w-6" strokeWidth={3} />
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
        className="inline-flex hover:opacity-80 transition-opacity"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={announcement.href} className="inline-flex hover:opacity-80 transition-opacity">
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
    <div className="flex min-w-max items-center gap-6 px-4 py-2 sm:gap-8 sm:px-8">
      {repeatedAnnouncements.map((announcement, index) => (
        <AnnouncementChip
          key={`${announcement._key || announcement.text}-${index}`}
          announcement={announcement}
        />
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y-4 border-black bg-[#ffe800] dark:bg-[#ffe800]">
      <div className="announcement-marquee flex w-max items-center" data-no-swipe="true">
        {track}
        {track}
        {track}
      </div>
    </div>
  );
}
