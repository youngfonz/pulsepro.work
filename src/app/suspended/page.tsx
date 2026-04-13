export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Account Suspended</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Your account has been suspended. If you believe this is an error, please contact support.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          <a href="mailto:info@pulsepro.work" className="text-primary hover:underline">
            info@pulsepro.work
          </a>
        </p>
      </div>
    </div>
  )
}
