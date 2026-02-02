import { SignIn } from '@clerk/nextjs'
import { neobrutalAuth } from '@/lib/clerk-theme'
import { Navigation } from '@/components/layout/Navigation'

export default function SignInPage() {
  return (
    <>
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-background py-12 px-4">
        <SignIn
          routing="path"
          path="/sign-in"
          appearance={neobrutalAuth}
        />
      </div>
    </>
  )
}
