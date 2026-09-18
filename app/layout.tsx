import type { Metadata, Viewport } from "next"
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Urban Growth Analytics — African Cities Satellite Dashboard",
  description:
    "Interactive analytics of satellite-derived urban expansion across 39 African cities (2000–2025): KPIs, growth prediction, an in-browser classifier, and a full data explorer.",
  keywords: [
    "urban growth",
    "satellite analytics",
    "African cities",
    "NDVI",
    "NDBI",
    "night lights",
    "urban expansion",
    "machine learning dashboard",
  ],
  authors: [{ name: "Urban Growth Analytics" }],
  openGraph: {
    title: "Urban Growth Analytics — African Cities Satellite Dashboard",
    description:
      "Satellite-derived city expansion patterns across African urban centers, 2000–2025.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#060b14",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlex.variable}`}>
      <body>{children}</body>
    </html>
  )
}
