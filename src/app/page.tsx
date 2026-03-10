import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { Hero } from '@/components/marketing/sections/Hero'
import { Features } from '@/components/marketing/sections/Features'
import { Testimonials } from '@/components/marketing/sections/Testimonials'
import { Pricing } from '@/components/marketing/sections/Pricing'
import { FAQ } from '@/components/marketing/sections/FAQ'
import { MobileApp } from '@/components/marketing/sections/MobileApp'
import { TelegramFeature } from '@/components/marketing/sections/TelegramFeature'
import { WhySwitch } from '@/components/marketing/sections/WhySwitch'
import { StatsImpact } from '@/components/marketing/sections/StatsImpact'
import { FinalCTA } from '@/components/marketing/sections/FinalCTA'

export const dynamic = 'force-dynamic'

export default async function MarketingPage() {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (clerkEnabled) {
    const { userId } = await auth()
    if (userId) {
      redirect('/dashboard')
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main id="main-content" className="relative z-0">
        <Hero />
        <StatsImpact />
        <Features />
        <MobileApp />
        <TelegramFeature />
        <Testimonials />
        <WhySwitch />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  )
}
