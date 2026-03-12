'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SignUp } from '@clerk/nextjs'
import { PulseLogo } from '@/components/PulseLogo'

const PLAN_PRODUCTS: Record<string, string | undefined> = {
  pro: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID,
  team: process.env.NEXT_PUBLIC_POLAR_TEAM_PRODUCT_ID,
}

function SignUpForm() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const productId = plan ? PLAN_PRODUCTS[plan] : undefined
  const redirectUrl = productId
    ? `/api/checkout?products=${productId}`
    : '/dashboard'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <PulseLogo size={40} />
            <span className="text-2xl font-bold text-foreground">Pulse Pro</span>
          </div>
          <p className="text-muted-foreground">Create your account to get started</p>
          {plan && (plan === 'pro' || plan === 'team') ? (
            <p className="text-xs text-primary mt-1">
              You&apos;ll be taken to checkout for the {plan === 'team' ? 'Team' : 'Pro'} plan after signing up
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/70 mt-1">Free plan — no credit card required</p>
          )}
        </div>
        <SignUp
          forceRedirectUrl={redirectUrl}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-border",
            }
          }}
        />
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <PulseLogo size={40} />
            <span className="text-2xl font-bold text-foreground">Pulse Pro</span>
          </div>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
