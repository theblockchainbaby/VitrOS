import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { ThemeProvider } from "next-themes";
import { HeartbeatProvider } from "@/components/heartbeat-provider";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: { index: false, follow: false },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VitrOS",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#285d46" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <TooltipProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </TooltipProvider>
            <Toaster />
            <ServiceWorkerRegister />
            <HeartbeatProvider />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
