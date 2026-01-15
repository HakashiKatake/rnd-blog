import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* SPARK Branding */}
        <div className="text-center mb-8">
          <h1 className="font-head text-4xl font-bold mb-2">
            Join <span className="text-primary">SPARK</span> ⚡
          </h1>
          <p className="text-muted-foreground">
            Start your journey. Build together. Prove your work.
          </p>
        </div>

        {/* Clerk Sign Up Component with Custom Styling */}
        <div className="border-brutal shadow-brutal p-6 bg-card">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  'bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all',
                card: 'shadow-none border-0',
                headerTitle: 'font-head text-2xl',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton:
                  'border-brutal hover:shadow-brutal-sm transition-all',
                formFieldInput: 'border-brutal focus:ring-primary',
                footerActionLink: 'text-primary hover:text-primary/90',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/explore"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <a href="/sign-in" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 border-brutal p-4 bg-primary/5">
          <h3 className="font-head font-bold mb-2">What you'll get:</h3>
          <ul className="text-sm space-y-1">
            <li>✅ Publish research posts & earn points</li>
            <li>✅ Join collaborative "What If..." quests</li>
            <li>✅ Build your verifiable portfolio</li>
            <li>✅ Connect with fellow engineers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
