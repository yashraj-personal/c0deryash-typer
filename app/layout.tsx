import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Caveat, DM_Serif_Display, Geist, Playfair_Display, Space_Mono } from 'next/font/google'
import './globals.css'
import { TrackerInit } from '@/components/tracker-init'

const serif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' })
const sans = Geist({ subsets: ['latin'], variable: '--font-geist' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-caveat' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' })
const mono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' })

export const metadata: Metadata = {
  title: 'type garden — type anything, watch it bloom',
  description:
    'A tiny typographic garden where every letter sprouts vines and flowers, plus a text match cut video maker. Made by YASH (@c0deryash).',
  authors: [{ name: 'YASH', url: 'https://www.instagram.com/c0deryash/' }],
}

export const viewport: Viewport = {
  themeColor: '#f3d4d9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${playfair.variable} ${caveat.variable} ${bebas.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <TrackerInit />
        {children}
      </body>
    </html>
  )
}
