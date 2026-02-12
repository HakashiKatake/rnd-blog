"use client";

/**
 * Next.js Route for Sanity Studio
 * This loads the Sanity Studio at /studio
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity/sanity.config";
import { Suspense, useEffect } from "react";

export default function StudioPage() {
  useEffect(() => {
    // Suppress known flushSync warning from next-sanity/styled-components in React 19
    const originalError = console.error;
    console.error = (...args) => {
      if (
        args[0]?.includes?.(
          "flushSync was called from inside a lifecycle method",
        )
      )
        return;
      originalError.call(console, ...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-black text-white font-bold">
          Loading Studio...
        </div>
      }
    >
      <NextStudio config={config} />
    </Suspense>
  );
}
