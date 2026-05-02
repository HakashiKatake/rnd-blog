"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const SWIPE_THRESHOLD = 75; // minimum horizontal distance to be considered a swipe
const MAX_VERTICAL_SWIPE = 50; // maximum vertical distance allowed (to ignore scrolling down/up)

// The ordered list of main bottom-bar routes
const routes = [
  "/explore",
  "/quests",
  "/events",
  "/collaborate",
  "/leaderboard",
];

export function SwipeNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Prevent swiping on desktop screens
    if (window.innerWidth > 768) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept if touching a horizontal slider, input, or textarea
      if (e.target instanceof Element && e.target.closest('.overflow-x-auto, .snap-x, input, textarea, button')) {
        return;
      }
      
      touchStartRef.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const distanceX = touchStartRef.current.x - touchEndX;
      const distanceY = Math.abs(touchStartRef.current.y - touchEndY);

      // Reset for next touch
      touchStartRef.current = null;

      // Ignore if user was mostly scrolling vertically
      if (distanceY > MAX_VERTICAL_SWIPE) return;

      const isLeftSwipe = distanceX > SWIPE_THRESHOLD;
      const isRightSwipe = distanceX < -SWIPE_THRESHOLD;

      if (isLeftSwipe || isRightSwipe) {
        const currentIndex = routes.indexOf(pathname);
        if (currentIndex === -1) return; // Only allow swipe navigation if currently on a main tab

        if (isLeftSwipe && currentIndex < routes.length - 1) {
          // Swipe Left -> Go to next route
          router.push(routes[currentIndex + 1]);
        } else if (isRightSwipe && currentIndex > 0) {
          // Swipe Right -> Go to previous route
          router.push(routes[currentIndex - 1]);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname, router]);

  return null;
}
