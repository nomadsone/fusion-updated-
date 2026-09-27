import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Merqato.Digital — Digital studio in Palawan',
  description:
    'Merqato.Digital is a creative technology studio based in Palawan. We build thoughtful websites, digital systems, and useful automations for ambitious businesses.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://merqato.digital'),
  openGraph: {
    title: 'Merqato.Digital — Local businesses. Distinct digital worlds.',
    description:
      'A creative technology studio rooted in Palawan, building thoughtful websites and practical digital systems for businesses everywhere.',
    url: 'https://merqato.digital',
    siteName: 'Merqato.Digital',
    images: [
      {
        url: '/merqato-hero.jpg',
        width: 1536,
        height: 864,
        alt: 'Misty limestone islands and calm water in Palawan',
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merqato.Digital — Local businesses. Distinct digital worlds.',
    description:
      'A creative technology studio rooted in Palawan, building thoughtful websites and practical digital systems for businesses everywhere.',
    images: ['/merqato-hero.jpg'],
  },
  keywords: [
    'digital studio Palawan',
    'web design Palawan',
    'web development Philippines',
    'digital systems',
    'business automation',
    'Merqato Digital',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-med)',
              color: 'var(--color-text-primary)',
            },
          }}
        />
      </body>
    </html>
  )
}
