import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* SPARK Branding */}
        <div className="text-center mb-8">
          <h1 className="font-head text-4xl font-bold mb-2">
            Welcome to <span className="text-primary">SPARK</span> ⚡
          </h1>
          <p className="text-muted-foreground">
            Sign in to ignite your ideas and collaborate
          </p>
        </div>

        {/* Clerk Sign In Component with Custom Styling */}
        <div className="border-brutal shadow-brutal p-6 bg-card">
          <SignIn
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
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            New to SPARK?{' '}
            <a href="/sign-up" className="text-primary hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
