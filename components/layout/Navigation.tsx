"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/retroui/Button";
import { ThemeToggle } from "./ThemeToggle";
import {
  Calendar,
  Compass,
  Handshake,
  Plus,
  ScrollText,
  Trophy,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { neobrutalAuth } from "@/lib/clerk-theme";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const navLinks: NavLink[] = [
  { href: "/explore", label: "Explore", shortLabel: "Explore", icon: Compass },
  { href: "/quests", label: "Quests", shortLabel: "Quests", icon: ScrollText },
  { href: "/events", label: "Events", shortLabel: "Events", icon: Calendar },
  {
    href: "/collaborate",
    label: "Collaborate",
    shortLabel: "Collab",
    icon: Handshake,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    shortLabel: "Top",
    icon: Trophy,
  },
];

const swipeRoutes = navLinks.map((link) => link.href);

function GlassNavLink({
  href,
  label,
  icon: Icon,
  active,
}: NavLink & {
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300",
        active
          ? "bg-white/70 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_30px_rgba(15,23,42,0.16)] dark:bg-white/18 dark:text-white"
          : "text-slate-700 hover:bg-white/45 hover:text-slate-950 dark:text-slate-200/88 dark:hover:bg-white/10 dark:hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

function MobileDockLink({
  href,
  shortLabel,
  icon: Icon,
  active,
}: NavLink & {
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.4rem] px-2 py-2 text-center transition-all duration-300",
        active
          ? "bg-white/72 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_20px_rgba(15,23,42,0.16)] dark:bg-white/18 dark:text-white"
          : "text-slate-600 dark:text-white/76",
      )}
    >
      <Icon className="h-[1.15rem] w-[1.15rem]" />
      <span className="max-w-[4.5rem] truncate text-[0.63rem] font-semibold tracking-[0.02em]">
        {shortLabel}
      </span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          'input, textarea, select, [contenteditable="true"], [data-no-swipe="true"]',
        )
      ) {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        return;
      }

      touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
      touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
    }

    function handleTouchEnd(event: TouchEvent) {
      if (
        touchStartXRef.current === null ||
        touchStartYRef.current === null ||
        typeof window === "undefined" ||
        window.innerWidth >= 768
      ) {
        return;
      }

      const currentRouteIndex = swipeRoutes.indexOf(pathname);
      if (currentRouteIndex === -1) {
        return;
      }

      const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
      const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
      const deltaX = endX - touchStartXRef.current;
      const deltaY = endY - touchStartYRef.current;

      touchStartXRef.current = null;
      touchStartYRef.current = null;

      if (Math.abs(deltaX) < 90 || Math.abs(deltaY) > 70) {
        return;
      }

      if (deltaX < 0 && currentRouteIndex < swipeRoutes.length - 1) {
        router.push(swipeRoutes[currentRouteIndex + 1]);
        return;
      }

      if (deltaX > 0 && currentRouteIndex > 0) {
        router.push(swipeRoutes[currentRouteIndex - 1]);
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname, router]);

  const leftDockLinks = navLinks.slice(0, 2);
  const rightDockLinks = navLinks.slice(2);

  return (
    <>
      <nav className="sticky top-0 z-[120] isolate w-full border-b border-white/30 bg-background/55 backdrop-blur-2xl pointer-events-auto shadow-[0_10px_35px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-slate-950/45">
        <div className="container mx-auto px-4">
          <div className="flex h-[4.8rem] items-center justify-between gap-3 md:h-[4.6rem]">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 rounded-full px-1.5 py-1 text-lg font-bold text-foreground sm:text-2xl"
            >
              <span className="font-head tracking-tight">SPARK</span>
              <Zap className="h-5 w-5 fill-primary text-primary" />
            </Link>

            <div className="hidden md:flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full border border-white/35 bg-white/50 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/8">
                {navLinks.slice(0, 2).map((link) => (
                  <GlassNavLink
                    key={link.href}
                    {...link}
                    active={pathname === link.href}
                  />
                ))}

                <Link
                  href="/create"
                  className="mx-1 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/75 bg-[linear-gradient(180deg,#ff8550_0%,#ff6b35_68%,#ff5928_100%)] text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.45),0_12px_30px_rgba(255,107,53,0.38)] transition-transform duration-300 hover:-translate-y-0.5"
                  aria-label="Create post"
                  title="Create post"
                >
                  <Plus className="h-5 w-5" />
                </Link>

                <div className="h-7 w-px rounded-full bg-slate-300/55 dark:bg-white/10" />

                {navLinks.slice(2).map((link) => (
                  <GlassNavLink
                    key={link.href}
                    {...link}
                    active={pathname === link.href}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              <SignedIn>
                <UserButton appearance={neobrutalAuth} afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="My Spark Profile"
                      labelIcon={<User className="w-4 h-4" />}
                      onClick={() => router.push(`/profile/${user?.id}`)}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>

              <SignedOut>
                <Link href="/sign-in" className="hidden sm:block">
                  <Button
                    size="sm"
                    className="rounded-full border-white/60 bg-[linear-gradient(180deg,#ff824d_0%,#ff6b35_70%,#ff5a2a_100%)] px-5 text-primary-foreground shadow-[inset_0_2px_0_rgba(255,255,255,0.45),0_8px_24px_rgba(255,107,53,0.35)]"
                  >
                    Get Started
                  </Button>
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed inset-x-0 bottom-[max(0.6rem,env(safe-area-inset-bottom))] z-[140] px-2 sm:px-3 md:hidden">
        <div className="mx-auto max-w-xl">
          <div className="rounded-[1.9rem] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.44))] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_18px_55px_rgba(15,23,42,0.24)] backdrop-blur-[30px] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(15,23,42,0.74))]">
            <div className="grid grid-cols-[0.86fr_0.86fr_auto_0.86fr_0.86fr_0.86fr] items-center gap-1">
              {leftDockLinks.map((link) => (
                <MobileDockLink
                  key={link.href}
                  {...link}
                  active={pathname === link.href}
                />
              ))}

              <Link href="/create" className="mx-1" data-no-swipe="true">
                <div className="inline-flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full border border-white/75 bg-[linear-gradient(180deg,#ff8550_0%,#ff6b35_68%,#ff5928_100%)] text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.45),0_12px_30px_rgba(255,107,53,0.38)]">
                  <Plus className="h-5 w-5" />
                </div>
              </Link>

              {rightDockLinks.map((link) => (
                <MobileDockLink
                  key={link.href}
                  {...link}
                  active={pathname === link.href}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
