export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.59-4.58a1 1 0 01.18-1.7l1.06-.6a1 1 0 011.22.16l3.07 3.07a1 1 0 001.42 0l7.07-7.07a1 1 0 011.22-.16l1.06.6a1 1 0 01.18 1.7L13.42 15.17a1.5 1.5 0 01-2 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">We&apos;ll be right back</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Pulse Pro is undergoing scheduled maintenance. We&apos;re working on improvements and will be back shortly.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          If you need immediate help, contact{' '}
          <a href="mailto:info@pulsepro.work" className="text-primary hover:underline">
            info@pulsepro.work
          </a>
        </p>
      </div>
    </div>
  )
}
