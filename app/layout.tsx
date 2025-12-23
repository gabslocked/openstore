import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { AuthProvider } from "@/hooks/use-auth"
import { StoreSettingsProvider } from "@/components/store-settings-provider"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://openstore.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OpenStore - E-commerce Platform',
    template: '%s | OpenStore'
  },
  description: 'Modern open source e-commerce platform. Built with Next.js and PostgreSQL.',
  keywords: ['ecommerce', 'store', 'shop', 'openstore', 'nextjs', 'open source'],
  authors: [{ name: 'OpenStore' }],
  creator: 'OpenStore',
  publisher: 'OpenStore',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'OpenStore',
    title: 'OpenStore - E-commerce Platform',
    description: 'Modern open source e-commerce platform',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'OpenStore',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenStore - E-commerce Platform',
    description: 'Modern open source e-commerce platform',
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${montserrat.className} bg-black min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
              <StoreSettingsProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </StoreSettingsProvider>
            </ThemeProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
