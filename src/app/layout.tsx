import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import { Be_Vietnam_Pro, Sora } from "next/font/google";

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
  title: "Airdrop $RECEBA",
  description:
    "Participe do Airdrop $RECEBA e ganhe tokens! Gire o carousel e ganhe de 2.000 a 10.000 tokens $RECEBA.",
  keywords: [
    "airdrop",
    "receba",
    "crypto",
    "solana",
    "spl token",
    "tokens",
    "meme coin",
  ],
  authors: [{ name: "$RECEBA Team" }],
  creator: "$RECEBA",
  publisher: "$RECEBA",
  robots: "index, follow",
  openGraph: {
    title: "Airdrop $RECEBA - Ganhe Tokens",
    description:
      "Participe do Airdrop $RECEBA e ganhe tokens! Gire o carousel e ganhe de 2.000 a 10.000 tokens.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airdrop $RECEBA - Ganhe Tokens",
    description:
      "Participe do Airdrop $RECEBA e ganhe tokens! Gire o carousel e ganhe de 2.000 a 10.000 tokens.",
  },
  icons: {
    icon: [
      { url: "/images/logo.PNG", sizes: "64x64", type: "image/png" },
      { url: "/images/logo.PNG", sizes: "192x192", type: "image/png" },
      { url: "/images/logo.PNG", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/logo.PNG", sizes: "180x180", type: "image/png" }],
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
        <link rel="icon" href="/images/logo.PNG" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1d224b",
              color: "#ffffff",
              border: "1px solid rgba(65, 174, 196, 0.3)",
            },
            success: {
              iconTheme: {
                primary: "#41aec4",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#e5484d",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

