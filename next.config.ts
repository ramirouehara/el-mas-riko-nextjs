import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images : {
    remotePatterns: [
      {
        protocol:"https",
        hostname:"imag.bonviveur.com",
        pathname:"/**",
      },
      {
        protocol:"https",
        hostname:"www.clarin.com",
        pathname:"/**",
      },
      {
        protocol:"https",
        hostname:"statics.diariomendoza.com.ar",
        pathname:"/**",
      }
    ],
  }
};

export default nextConfig;
