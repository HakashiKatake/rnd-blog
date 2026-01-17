import { SignUp } from '@clerk/nextjs'
import { Navigation } from '@/components/layout/Navigation'

export default function SignUpPage() {
  return (
    <>
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-background py-12 px-4">
        <SignUp
          routing="path"
          path="/sign-up"
        />
      </div>
    </>
  )
}
