import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['unzipper'],
  allowedDevOrigins: ['192.168.1.116'],
};

export default nextConfig;
