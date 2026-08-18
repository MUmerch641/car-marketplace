import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/sign/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "rjhsgtpkifmfunemvezw.supabase.co", pathname: "/**" }
    ],
  },
};

export default nextConfig;
