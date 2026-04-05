import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Rules and Policies for Using Pulse Pro',
  description: 'Read the terms and conditions for using Pulse Pro. Covers account responsibilities, payment terms, data ownership, and service availability.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main id="main-content" className="max-w-3xl mx-auto px-4 md:px-8 py-20">
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground font-medium">Last updated: February 17, 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using Pulse Pro, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you should not create an account or use the service. These terms apply to all users, including visitors, free-tier users, and paid subscribers.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>Pulse Pro is a project and task management tool designed for freelancers, consultants, and small teams. The service allows you to create and manage projects, tasks, clients, and deadlines in one place. We offer a free tier with limited usage (3 projects, 50 tasks, 1 client) and a paid Pro tier with unlimited access to all features.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality and security of your account credentials. You must provide accurate and complete information when creating an account. You agree to notify us immediately of any unauthorized use of your account. You may not use the service for any illegal or unauthorized purpose, and you must comply with all applicable laws and regulations.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Payment Terms</h2>
            <p>Pro subscriptions are billed monthly at $12/month, and Team subscriptions at $29/month. Payment is processed securely through our payment provider, Polar. You can cancel your subscription at any time — your access will continue until the end of the current billing period. We do not offer prorated refunds for partial months, but refund requests are handled on a case-by-case basis. We reserve the right to change pricing with 30 days notice to existing subscribers.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data Ownership</h2>
            <p>You retain full ownership of all content you create in Pulse Pro, including projects, tasks, notes, and uploaded files. We do not claim any intellectual property rights to your content. You can export or delete all of your information at any time. When you delete your account, we will permanently remove all associated content from our systems.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Acceptable Use</h2>
            <p>You agree not to use Pulse Pro to store or transmit any content that is unlawful, harmful, threatening, or otherwise objectionable. You may not attempt to gain unauthorized access to other users&apos; accounts or our internal systems. You may not use automated tools to scrape, crawl, or otherwise extract content from the service without our written permission.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Service Availability</h2>
            <p>We strive for high availability but do not guarantee uninterrupted or error-free service. We may perform scheduled maintenance that temporarily affects access, and we will make reasonable efforts to notify users of planned downtime in advance. We are not liable for any loss or damage resulting from service interruptions, whether planned or unplanned.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>Pulse Pro is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability shall not exceed the amount you have paid us in the 12 months preceding the claim.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Changes to Terms</h2>
            <p>We may update these terms from time to time to reflect changes in our service or applicable laws. We will notify registered users of material changes via email at least 14 days before they take effect. Your continued use of Pulse Pro after changes take effect constitutes acceptance of the revised terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p>For questions about these terms or any other legal matter, contact us at support@pulsepro.work.</p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
