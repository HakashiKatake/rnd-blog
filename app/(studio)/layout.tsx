
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPARK Studio",
  description: "Sanity Studio for managing SPARK content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
