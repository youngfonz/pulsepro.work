import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — How Pulse Pro Protects Your Data',
  description: 'Learn how Pulse Pro collects, uses, and protects your data. We store only what we need and never sell your information to third parties.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main id="main-content" className="max-w-3xl mx-auto px-4 md:px-8 py-20">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground font-medium">Last updated: April 12, 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>When an account is created, we collect a name and email address through our authentication provider (Clerk). As the service is used, we store the projects, tasks, clients, invoices, and bookmarks that are created. We also collect basic usage analytics to improve the service, such as which features are used most frequently.</p>
            <p>If you use our AI Insights feature (Pro and Team plans), your project and task data is sent to Anthropic for analysis. This data is processed in real time and is not stored by Anthropic for training purposes.</p>
            <p>If you use our Email-to-Task feature, we process incoming email subject lines and body text to create tasks. Sender information is stored as part of the task description.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use collected information solely to provide the Pulse Pro service — managing projects, tasks, and clients. We do not sell or share personal information with third parties for marketing purposes. We may send transactional emails (e.g., invoice delivery, daily task reminders) via Resend if opted in through account settings.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Data Storage and Security</h2>
            <p>All structured data (projects, tasks, clients, invoices) is stored securely in a PostgreSQL database hosted by Neon. File uploads and images are stored via Vercel Blob. The application is hosted on Vercel. All communication between your browser and our servers is encrypted in transit using TLS. We implement industry-standard security measures to protect against unauthorized access, alteration, or destruction of personal information.</p>
            <p>API tokens are stored as SHA-256 hashes — we never store your raw API token after initial generation. Invoice share tokens and Telegram verification codes are generated using cryptographically secure random values.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate Pulse Pro:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Clerk — authentication and account management</li>
              <li>Vercel — application hosting, file storage (Vercel Blob), and anonymous analytics</li>
              <li>Neon — PostgreSQL database hosting</li>
              <li>Polar — subscription and payment processing</li>
              <li>Resend — transactional email delivery (invoice emails, daily reminders)</li>
              <li>Anthropic — AI-powered insights analysis (Pro and Team plans only)</li>
              <li>Telegram — optional bot integration for task management (Pro and Team plans)</li>
            </ul>
            <p>Each of these services has their own privacy policy governing how they handle the information they process on our behalf. We only share the minimum data necessary for each service to function.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Cookies and Tracking</h2>
            <p>Pulse Pro uses essential cookies required for authentication and session management. We use Vercel Analytics and Vercel Speed Insights to collect anonymous, aggregated usage and performance statistics. We do not use advertising trackers, and we do not build user profiles for targeting purposes.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Data Retention</h2>
            <p>Your data is retained for as long as your account is active. When you delete your account, all associated content — including projects, tasks, clients, invoices, files, and personal information — is permanently removed from our systems within 30 days. Backups containing deleted data are purged on their regular rotation cycle, which does not exceed 90 days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
            <p>All users have the right to access, correct, or delete personal information we hold. Project and task data can be exported at any time. Accounts can be deleted, which permanently removes all associated content and personal information from our systems.</p>
            <p><strong>For users in the European Economic Area (GDPR):</strong> You have the right to access, rectify, erase, restrict processing, and port your data. You also have the right to object to processing and to withdraw consent at any time. To exercise these rights, contact us at info@pulsepro.work.</p>
            <p><strong>For users in California (CCPA):</strong> You have the right to know what personal information we collect and how it is used, to request deletion of your personal information, and to opt out of the sale of personal information. We do not sell personal information. To exercise these rights, contact us at info@pulsepro.work.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Children&apos;s Privacy</h2>
            <p>Pulse Pro is not intended for use by anyone under the age of 16. We do not knowingly collect personal information from children under 16. If we learn that we have collected information from a child under 16, we will promptly delete that information. If you believe a child under 16 has provided us with personal information, please contact us at info@pulsepro.work.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. We will notify registered users of material changes via email at least 14 days before they take effect. Your continued use of Pulse Pro after any changes constitutes acceptance of the updated policy.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p>For privacy-related questions or to exercise any of the rights described above, contact us at{' '}
              <a href="mailto:info@pulsepro.work" className="text-primary hover:underline">info@pulsepro.work</a>.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
