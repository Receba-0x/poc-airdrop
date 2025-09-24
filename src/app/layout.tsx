import Providers from "@/components/Providers";
import type { Metadata } from "next";
import "./globals.css";
import { Nunito_Sans, Sora, Be_Vietnam_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "react-hot-toast";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loot4Fun",
  description:
    "The next big thing in crypto - Loot4Fun is here to rule the meme world!",
  keywords: ["meme coin", "crypto", "solana", "rat", "rodolfo"],
  authors: [{ name: "Loot4Fun Team" }],
  creator: "Loot4Fun",
  publisher: "Loot4Fun",
  robots: "index, follow",
  openGraph: {
    title: "Loot4Fun - Boxes",
    description: "The next big thing in crypto!",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loot4Fun - Boxes",
    description: "The next big thing in crypto!",
  },
  icons: {
    icon: [
      { url: "/images/logo_token.png", sizes: "64x64", type: "image/png" },
      { url: "/images/logo_token.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo_token.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/logo_token.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`scroll-smooth dark antialiased ${sora.variable} ${beVietnamPro.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/logo_token.png" />
      </head>
      <body>
        <Toaster position="bottom-right" />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
