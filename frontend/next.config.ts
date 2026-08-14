import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://wsio-2p7e5pv3q-atluixx.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
