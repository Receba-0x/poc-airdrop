import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://secure.walletconnect.org https://api.web3modal.org; connect-src 'self' https://api.coingecko.com/api/v3/simple/price https://api.web3modal.org https://pulse.walletconnect.org https://secure.walletconnect.org/ https://rpc.walletconnect.org/v1/ https://bnb-testnet.g.alchemy.com/v2/MyJKsFQ0AIqA2MWPTRwV-; img-src 'self' data: blob:;",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer-when-downgrade",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
