import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PVE Tool - Track Your Token PNL | BNB Chain Token Analysis",
  description: "Analyze your BNB Chain trading activity and see if you're diamond hands or paper hands. Track token movements, calculate your paperhand score, and share your trading results.",
  keywords: ["BNB Chain", "token analysis", "paper hands", "diamond hands", "crypto trading", "blockchain analytics", "PVE Tool"],
  authors: [{ name: "PVE Launcher" }],
  openGraph: {
    title: "PVE Tool - Check How Jeet You Are",
    description: "Analyze your BNB Chain trading activity and see if you're diamond hands or paper hands",
    type: "website",
    images: [
      {
        url: "/happy/pve.png",
        width: 1200,
        height: 630,
        alt: "PVE Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PVE Tool - Check How Jeet You Are",
    description: "Analyze your PVE launched tokens on BNB Chain for trading activity and see if you're diamond hands or paper hands",
    images: ["/happy/pve.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#100037",
  icons: {
    icon: "/happy/pve.png",
    apple: "/happy/pve.png",
    shortcut: "/happy/pve.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PVE Tool" />
      </head>
      <body
        className={`${oxanium.variable} antialiased`}
        style={{ fontFamily: 'var(--font-oxanium), Helvetica, Arial, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
