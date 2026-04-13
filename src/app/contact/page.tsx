import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Pulse Pro — Questions, Feedback, and Support',
  description: 'Get in touch with the Pulse Pro team for general inquiries, technical support, or privacy questions. We respond to most messages within one business day.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main id="main-content" className="max-w-3xl mx-auto px-4 md:px-8 py-20">
        <h1 className="text-3xl font-bold text-foreground mb-8">Contact Us</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            Have a question, feature request, or just want to say hi? We&apos;d love to hear from you. We&apos;re a small team, so every message gets read by a real person — usually the person who built the feature you&apos;re asking about.
          </p>

          <p>
            We respond to most messages within one business day. For urgent account issues, please include your account email so we can look you up quickly.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">General Inquiries</h2>
            <p>
              For general questions, partnership ideas, or feedback on how we can make Pulse Pro better, reach us at{' '}
              <a href="mailto:info@pulsepro.work" className="text-primary hover:underline">
                info@pulsepro.work
              </a>. We appreciate hearing what&apos;s working well and what could be improved.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Technical Support</h2>
            <p>
              Need help with your account, experiencing a bug, or have a technical issue? Email our support team at{' '}
              <a href="mailto:support@pulsepro.work" className="text-primary hover:underline">
                support@pulsepro.work
              </a>. When reporting an issue, please include what you were doing when it happened and any error messages you saw — it helps us resolve things faster.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Privacy and Data Requests</h2>
            <p>
              For privacy-related questions, data export requests, or account deletion inquiries, contact{' '}
              <a href="mailto:privacy@pulsepro.work" className="text-primary hover:underline">
                privacy@pulsepro.work
              </a>. You can learn more about how we handle your information in our{' '}
              <a href="/privacy" className="text-primary hover:underline">privacy policy</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Feature Requests</h2>
            <p>
              We build Pulse Pro based on real feedback from our users. If there&apos;s a feature you&apos;d like to see, send it to{' '}
              <a href="mailto:info@pulsepro.work" className="text-primary hover:underline">
                info@pulsepro.work
              </a> with &quot;Feature Request&quot; in the subject line. We review every suggestion and prioritize based on what will help the most people.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Response Times</h2>
            <p>
              We aim to respond to all messages within one business day. Support requests are handled first, followed by general inquiries. If something is time-sensitive, mention it in the subject line and we&apos;ll do our best to get back to you sooner. We&apos;re a small team, but we take every message seriously.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Connect With Us</h2>
            <p>
              Follow along as we build Pulse Pro in public. We share product updates, behind-the-scenes decisions, and roadmap previews. Whether you&apos;re a current user or just exploring, we&apos;re always happy to chat about project management, freelancing, or building better tools for independent workers.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
