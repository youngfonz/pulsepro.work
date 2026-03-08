import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { AuthGuard } from "@/components/AuthGuard";
import { getClientCount } from "@/actions/dashboard";
import { getMaintenanceMode } from "@/actions/admin";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL("https://pulsepro.work"),
  title: "Pulse Pro — Project & Task Management",
  description: "Plan, track, and manage your projects and tasks in one place. Organize clients, set deadlines, and stay on top of your work with Pulse Pro.",
  openGraph: {
    title: "Pulse Pro — Project & Task Management",
    description: "Plan, track, and manage your projects and tasks in one place. Organize clients, set deadlines, and stay on top of your work with Pulse Pro.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse Pro — Project & Task Management",
    description: "Plan, track, and manage your projects and tasks in one place.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Check auth first — only call auth-dependent functions when signed in
  let clientCount = 0;
  let isAdmin = false;
  let userId: string | null = null;

  if (clerkEnabled) {
    try {
      const session = await auth();
      userId = session.userId;
      isAdmin = userId ? isAdminUser(userId) : false;
    } catch {
      // auth() may fail on public routes — safe to ignore
    }
  }

  // Only fetch data when we have an authenticated user
  if (userId) {
    clientCount = await getClientCount();

    // Check maintenance mode and suspension for non-admin users
    // Note: /maintenance and /suspended are bypass paths in middleware,
    // so auth() returns null for them — no redirect loop possible
    if (!isAdmin) {
      const [maintenanceOn, subscription] = await Promise.all([
        getMaintenanceMode(),
        prisma.subscription.findUnique({ where: { userId }, select: { suspendedAt: true } }),
      ]);

      if (maintenanceOn) {
        redirect('/maintenance');
      }

      if (subscription?.suspendedAt) {
        redirect('/suspended');
      }
    }
  }

  const innerContent = (
    <ThemeProvider>
      <LayoutWrapper clientCount={clientCount} clerkEnabled={clerkEnabled} isAdmin={isAdmin} isAuthenticated={!!userId}>
        {children}
      </LayoutWrapper>
    </ThemeProvider>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ // ship-safe-ignore
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) { /* localStorage unavailable in private browsing */ }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {clerkEnabled ? (
          <ClerkProvider>
            <AuthGuard>
              {innerContent}
            </AuthGuard>
          </ClerkProvider>
        ) : (
          innerContent
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
