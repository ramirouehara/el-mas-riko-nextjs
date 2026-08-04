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
      },
      {
        protocol:"https",
        hostname:"upload.wikimedia.org",
        pathname:"/**",
      },
      {
        protocol:"https",
        hostname:"images.getrecipekit.com",
        pathname:"/**",
      },
      {
        protocol:"https",
        hostname:"i0.wp.com",
        pathname:"/**",
      },
      {
        protocol:"https",
        hostname:"www.semanarioextra.com.ar",
        pathname:"/**",
      }
    ],
  }
};

export default nextConfig;
