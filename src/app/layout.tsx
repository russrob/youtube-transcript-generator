import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScriptForge AI - YouTube Transcript to Script Generator',
  description: 'Transform YouTube videos into polished scripts with AI-powered generation. Generate professional scripts in 60 seconds with hooks, titles, and premium features.',
  keywords: 'YouTube transcript, script generator, AI script writer, video to script, content creation, YouTube tools',
  authors: [{ name: 'ScriptForge AI' }],
  creator: 'ScriptForge AI',
  publisher: 'ScriptForge AI',
  robots: 'index, follow',
  openGraph: {
    title: 'ScriptForge AI - Transform YouTube Videos into Professional Scripts',
    description: 'Generate professional scripts from YouTube videos in seconds using AI. Perfect for content creators, marketers, and educators.',
    url: 'https://scriptforge.ai',
    siteName: 'ScriptForge AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ScriptForge AI - YouTube Script Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScriptForge AI - YouTube Script Generator',
    description: 'Transform YouTube videos into professional scripts with AI in 60 seconds.',
    images: ['/og-image.png'],
    creator: '@scriptforge',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}