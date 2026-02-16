import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { WebAppJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "WaveSync — Immersive Music Player",
    template: "%s | WaveSync",
  },
  description:
    "Experience music like never before. WaveSync delivers real-time audio visualization, frequency analysis, and low-latency playback powered by Web Audio API. Browse by genre, build playlists, and enjoy immersive visualizers.",
  keywords: [
    "music player",
    "audio visualizer",
    "web audio api",
    "playlist",
    "streaming",
    "equalizer",
    "waveform",
    "frequency analyzer",
    "pwa music app",
  ],
  authors: [{ name: "WaveSync" }],
  creator: "WaveSync",
  publisher: "WaveSync",
  metadataBase: new URL("https://wavesync.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "WaveSync",
    title: "WaveSync — Immersive Music Player",
    description:
      "Real-time audio visualization, frequency analysis, and low-latency playback. Browse genres, build playlists, and experience music visually.",
    images: [
      {
        url: "/icons/icon-512.svg",
        width: 512,
        height: 512,
        alt: "WaveSync Music Player",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WaveSync — Immersive Music Player",
    description:
      "Real-time audio visualization and low-latency playback powered by Web Audio API.",
    images: ["/icons/icon-512.svg"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WaveSync",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebAppJsonLd />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
