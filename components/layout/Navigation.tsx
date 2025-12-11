'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/retroui/Button'

export function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-head text-2xl font-bold">
            SPARK <span className="text-primary">⚡</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className={`font-body transition-colors ${
                isActive('/explore')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/quests"
              className={`font-body transition-colors ${
                isActive('/quests')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Quests
            </Link>
            <Link
              href="/collaborate"
              className={`font-body transition-colors ${
                isActive('/collaborate')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Collaborate
            </Link>
            <Link
              href="/leaderboard"
              className={`font-body transition-colors ${
                isActive('/leaderboard')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Leaderboard
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <SignedIn>
              {/* Create Button */}
              <Link href="/create">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm transition-all"
                >
                  Create +
                </Button>
              </Link>

              {/* User Profile Button */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 border-2 border-black',
                    userButtonPopoverCard: 'border-brutal shadow-brutal',
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>

            <SignedOut>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-brutal hover:shadow-brutal-sm transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm transition-all"
                >
                  Get Started
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  )
}
