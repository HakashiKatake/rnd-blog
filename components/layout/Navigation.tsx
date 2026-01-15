'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/retroui/Button'
import { FaBolt, FaCompass, FaScroll, FaHandshake, FaTrophy, FaUser } from 'react-icons/fa6'

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-head text-2xl font-bold flex items-center gap-1">
            SPARK <FaBolt className="text-primary text-xl" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className={`font-body transition-colors flex items-center gap-2 ${isActive('/explore')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
                }`}
            >
              <FaCompass /> Explore
            </Link>
            <Link
              href="/quests"
              className={`font-body transition-colors flex items-center gap-2 ${isActive('/quests')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
                }`}
            >
              <FaScroll /> Quests
            </Link>
            <Link
              href="/collaborate"
              className={`font-body transition-colors flex items-center gap-2 ${isActive('/collaborate')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
                }`}
            >
              <FaHandshake /> Collaborate
            </Link>
            <Link
              href="/leaderboard"
              className={`font-body transition-colors flex items-center gap-2 ${isActive('/leaderboard')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
                }`}
            >
              <FaTrophy /> Leaderboard
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <SignedIn>
              {/* Profile Link (New) */}
              {user && (
                <Link href={`/profile/${user.id}`}>
                  <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                    <FaUser />
                  </Button>
                </Link>
              )}

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
