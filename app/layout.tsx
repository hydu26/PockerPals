import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, DM_Sans } from "next/font/google"
import Providers from "@/components/shared/providers"
import SwRegister from "@/components/shared/sw-register"
import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "PokerPals", template: "%s · PokerPals" },
  description: "Theo dõi điểm poker cho nhóm bạn — nhanh, gọn, đẹp. Quản lý điểm số, xếp hạng, lịch sử phiên chơi dễ dàng.",
  keywords: ["poker", "điểm poker", "theo dõi điểm", "nhóm poker", "poker việt nam", "score tracker"],
  authors: [{ name: "PokerPals" }],
  creator: "PokerPals",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PokerPals",
  },
  openGraph: {
    title: "PokerPals",
    description: "Theo dõi điểm poker cho nhóm bạn — nhanh, gọn, đẹp.",
    type: "website",
    locale: "vi_VN",
    siteName: "PokerPals",
    url: APP_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PokerPals — Theo dõi điểm poker cho nhóm bạn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PokerPals",
    description: "Theo dõi điểm poker cho nhóm bạn — nhanh, gọn, đẹp.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#07050f" },
    { media: "(prefers-color-scheme: light)", color: "#fff7f5" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${ibmPlexMono.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
        <SwRegister />
      </body>
    </html>
  )
}
