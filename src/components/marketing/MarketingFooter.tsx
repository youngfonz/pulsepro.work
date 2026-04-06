import Link from 'next/link'
import { PulseLogo } from '@/components/PulseLogo'

export function MarketingFooter() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Knowledge Base', href: '/kb' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ]

  return (
    <footer className="bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold text-foreground mb-4">
                {section.title}
              </p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-black/10 dark:border-white/10 mb-8" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <PulseLogo size={28} />
            <span className="text-lg font-semibold text-foreground font-[family-name:var(--font-display)]">Pulse Pro</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pulse Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
