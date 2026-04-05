import Link from 'next/link'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <ScrollReveal>
          <div className="rounded-2xl bg-primary px-8 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground tracking-tight">
              Stop losing work to tab overload.
            </h2>

            <p className="text-base text-primary-foreground/80 mt-4 max-w-md mx-auto">
              Every client, project, and deadline in one place.
              Set up in 5 minutes. Free forever.
            </p>

            <Link
              href="/sign-up"
              className="mt-8 inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary-foreground text-primary text-sm font-semibold hover:bg-primary-foreground/90 transition-colors shadow-lg shadow-primary/20"
            >
              Get started — it&apos;s free
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <p className="mt-4 text-sm text-primary-foreground/60">
              Free forever. No credit card required.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
