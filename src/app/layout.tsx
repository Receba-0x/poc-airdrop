import Providers from "@/components/Providers";
import type { Metadata } from "next";
import "./globals.css";
import { Nunito_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const nunito = Nunito_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Imperador Token",
  description: "Imperador Token",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`scroll-smooth ${nunito.className}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/logo_token.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
